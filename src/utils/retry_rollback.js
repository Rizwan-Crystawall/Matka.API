const axios = require("axios"); // fixed import (no destructuring)
const { Queue, Worker } = require("bullmq");
const { v4: uuidv4 } = require("uuid"); // fixed uuid import
const IORedis = require("ioredis");
const {
  createBetSettlementsEntry,
  updateBetSettlementsRetryCount,
  updateBetSettlementsWithReqId,
  getBatchByRequestIdRollback,
  getCallbackUrl,
} = require("../modal/BetModal");

const batches = new Map();
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 60 * 1000;

const connection = new IORedis("redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

const retryQueue = new Queue("retry-settlements-rollback", { connection });

const retryWorker = new Worker(
  "retry-settlements-rollback",
  async (job) => {
    const requestId = job.data.requestId;
    const dbBatche = await getBatchByRequestIdRollback(requestId);
    const dbBatch = dbBatche[0];
    if (!dbBatch) {
      console.log(`No batch found in DB for retry with requestId ${requestId}`);
      return;
    }

    if (dbBatch.retry_count >= MAX_RETRIES) {
      console.error(`Max retries reached for batch ${requestId}`);
      return;
    }

    console.log(`Retry attempt #${dbBatch.retry_count + 1} for batch ${requestId}`);
    await updateBetSettlementsRetryCount(requestId);

    const payload = JSON.parse(dbBatch.payload);
    const failedBets = JSON.parse(dbBatch.failed_bets || "[]");

    const retryPayload = prepareRetryPayload(payload, failedBets);
    if (
      retryPayload.bets.winners.length === 0 &&
      retryPayload.bets.losers.length === 0
    ) {
      console.log(`No failed bets left to retry for batch ${requestId}`);
      await updateBetSettlementsWithReqId(requestId, "success", []);
      return;
    }

    try {
      const response = await sendSettlement(retryPayload, dbBatch.callback_url);
      const { newStatus, updatedFailedBets } = handleResponse(response, payload);
      await updateBetSettlementsWithReqId(requestId, newStatus, updatedFailedBets);
      if (newStatus === "partial" || newStatus === "failed") {
        const delay = RETRY_DELAY_BASE_MS * Math.pow(2, dbBatch.retry_count + 1);
        await retryQueue.add("retry-settlements-rollback", { requestId }, { delay });
      }
    } catch (err) {
      console.error(`Retry failed for batch ${requestId}:${dbBatch.callback_url}`, err.message);
      if (dbBatch.retry_count + 1 < MAX_RETRIES) {
        await retryQueue.add("retry-settlements-rollback", { requestId }, { delay: RETRY_DELAY_BASE_MS });
      }else{
        console.log(`Maximum Retries, Manual Intervention Required! ${requestId} ${dbBatch.callback_url}`);
      }
    }
  },
  { connection }
);

async function sendSettlement(payload, callbackUrl) {
  const response = await axios.post(callbackUrl, payload, {
    headers: {
      Authorization: `Bearer ${payload.token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": payload.requestId,
    },
    timeout: 10000,
  });
  return response.data;
}

function prepareRetryPayload(payload, failedBets) {
  const filterBets = (bets, failedIds) =>
    bets
      .map((bet) => {
        const filteredIds = bet.clientBetId.filter((id) =>
          failedIds.includes(id)
        );
        if (filteredIds.length === 0) return null;
        return {
          ...bet,
          clientBetId: filteredIds,
        };
      })
      .filter(Boolean);

  return {
    operatorId: payload.operatorId,
    token: payload.token,
    requestId: payload.requestId,
    transactionId: payload.transactionId,
    bets: {
      winners: filterBets(payload.bets.winners, failedBets),
      losers: filterBets(payload.bets.losers, failedBets),
    },
  };
}

function handleResponse(response, payload) {
  if (response.status === "RS_OK") {
    console.log(`Batch ${payload.requestId} fully settled.`);
    return { newStatus: "success", updatedFailedBets: [] };
  }

  if (response.status === "RS_PARTIAL") {
    const failedBets = [];

    for (const bet of response.bets?.winners || []) {
      if (bet.betStatus !== "settled") failedBets.push(...bet.clientBetId);
    }
    for (const bet of response.bets?.losers || []) {
      if (bet.betStatus !== "settled") failedBets.push(...bet.clientBetId);
    }

    console.log(`Batch ${payload.requestId} partially settled. Failed bets:`, failedBets);
    return { newStatus: "partial", updatedFailedBets: failedBets };
  }

  const allFailed = payload.bets.winners
    .flatMap((b) => b.clientBetId)
    .concat(payload.bets.losers.flatMap((b) => b.clientBetId));

  console.log(`Batch ${payload.requestId} settlement failed completely.`);
  return { newStatus: "failed", updatedFailedBets: allFailed };
}

async function sendNewBatchForRollback(payload, callbackUrl) {
  const { requestId, transactionId, operatorId } = payload;

  const batchData = {
    request_id: requestId,
    transaction_id: transactionId,
    operator_id: operatorId,
    status: "pending",
    payload,
    retry_count: 0,
    failed_bets: [],
    callback_url: callbackUrl,
  };

  await createBetSettlementsEntry(batchData);

  try {

    const response = await sendSettlement(payload, callbackUrl);
    const { newStatus, updatedFailedBets } = handleResponse(response, payload);

    await updateBetSettlementsWithReqId(requestId, newStatus, updatedFailedBets);

    if (newStatus === "partial" || newStatus === "failed") {
      await retryQueue.add("retry-settlements-rollback", { requestId }, { delay: RETRY_DELAY_BASE_MS });
    }
  } catch (err) {

    console.error(`Initial settlement failed for batch ${requestId}:${callbackUrl}`, err.message);
    const allFailed = payload.bets.winners
      .flatMap((b) => b.clientBetId)
      .concat(payload.bets.losers.flatMap((b) => b.clientBetId));

    await updateBetSettlementsWithReqId(requestId, "failed", allFailed);
    await retryQueue.add("retry-settlements-rollback", { requestId }, { delay: RETRY_DELAY_BASE_MS });
  }
}

module.exports = {
  sendNewBatchForRollback,
};
