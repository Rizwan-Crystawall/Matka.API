const axios = require('axios');                   // fixed import (no destructuring)
const { Queue, Worker } = require('bullmq');
const { v4: uuidv4 } = require('uuid');           // fixed uuid import
const IORedis = require('ioredis');
const { createBetSettlementsEntry, updateBetSettlementsRetryCount } = require('../modal/BetModal');

// --- In-memory batch store (replace with DB in production) ---
const batches = new Map();

// Constants
const MAX_RETRIES = 3;
// const OPERATOR_API_URL = 'https://operator.com/api/settle-bets'; // Replace with real URL
const RETRY_DELAY_BASE_MS = 60 * 1000; // 1 minute base delay for retries

const connection = new IORedis("redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null
});

// Create the retry queue
const retryQueue = new Queue('retry-settlements', { connection });

// *** MAIN CHANGE: create a Worker with your processor callback ***
// No QueueScheduler needed anymore!
const retryWorker = new Worker('retry-settlements', async job => {
  const requestId = job.data.requestId;
  const batch = batches.get(requestId);
  if (!batch) {
    console.log(`No batch found for retry with requestId ${requestId}`);
    return;
  }

  if (batch.retryCount >= MAX_RETRIES) {
    console.error(`Max retries reached for batch ${requestId}. Manual intervention required.`);
    return;
  }

  console.log(`Retry attempt #${batch.retryCount + 1} for batch ${requestId}`);
  updateBetSettlementsRetryCount(requestId);

  const retryPayload = prepareRetryPayload(batch);
  if (
    retryPayload.bets.winners.length === 0 &&
    retryPayload.bets.losers.length === 0
  ) {
    console.log(`No failed bets left to retry for batch ${requestId}`);
    batch.status = 'success'; // everything settled
    batch.failedBets = [];
    return;
  }

  try {
    const response = await sendSettlement(retryPayload, batch.callbackUrl);
    handleResponse(response, batch);

    batch.retryCount++;
    batch.lastAttempt = new Date();
    batches.set(requestId, batch);

    if (batch.status === 'partial' || batch.status === 'failed') {
      // Schedule another retry with exponential backoff
      const delay = RETRY_DELAY_BASE_MS * Math.pow(2, batch.retryCount);
      await retryQueue.add('retry-settlement', { requestId }, { delay });
    }
  } catch (err) {
    console.error(`Retry failed for batch ${requestId}:`, err.message);
    batch.retryCount++;
    batch.lastAttempt = new Date();
    batches.set(requestId, batch);

    // Schedule another retry with exponential backoff
    const delay = RETRY_DELAY_BASE_MS * Math.pow(2, batch.retryCount);
    await retryQueue.add('retry-settlement', { requestId }, { delay });
  }
}, { connection });   // pass connection here

// --- The rest of your code remains unchanged ---

async function sendSettlement(payload, callbackUrl) {
  try {
    const response = await axios.post(callbackUrl, payload, {
      headers: {
        Authorization: `Bearer ${payload.token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': payload.requestId
      },
      timeout: 10000
    });
    return response.data;
  } catch (err) {
    throw err;
  }
}

function handleResponse(response, batch) {
  if (response.status === 'RS_OK') {
    batch.status = 'success';
    batch.failedBets = [];
    console.log(`Batch ${batch.requestId} fully settled.`);
  } else if (response.status === 'RS_PARTIAL') {
    batch.status = 'partial';
    const failedBets = [];

    if (response.bets?.winners) {
      response.bets.winners.forEach(bet => {
        if (bet.bet_status !== 'settled') failedBets.push(...bet.client_bet_id);
      });
    }
    if (response.bets?.losers) {
      response.bets.losers.forEach(bet => {
        if (bet.bet_status !== 'settled') failedBets.push(...bet.client_bet_id);
      });
    }

    batch.failedBets = failedBets;
    console.log(`Batch ${batch.requestId} partially settled. Failed bets:`, failedBets);
  } else {
    batch.status = 'failed';
    batch.failedBets = batch.payload.bets.winners
      .flatMap(b => b.client_bet_id)
      .concat(batch.payload.bets.losers.flatMap(b => b.client_bet_id));
    console.log(`Batch ${batch.requestId} settlement failed completely.`);
  }
}

function prepareRetryPayload(batch) {
  const filterBets = (bets, failedIds) =>
    bets
      .map(bet => {
        const filteredIds = bet.client_bet_id.filter(id => failedIds.includes(id));
        if (filteredIds.length === 0) return null;
        return {
          ...bet,
          client_bet_id: filteredIds
        };
      })
      .filter(Boolean);

  return {
    operatorId: batch.payload.operatorId,
    token: batch.payload.token,
    requestId: batch.requestId,
    transactionId: batch.payload.transactionId,
    bets: {
      winners: filterBets(batch.payload.bets.winners, batch.failedBets),
      losers: filterBets(batch.payload.bets.losers, batch.failedBets),
    }
  };
}

async function sendNewBatch(payload, callbackUrl) {
  const requestId = payload.requestId;
  const transactionId = payload.transactionId;
  const operatorId = payload.operatorId;
  const isClosedType = payload.isClosedType;
  batches.set(requestId, {
    requestId,
    operatorId,
    transactionId,
    isClosedType,
    payload,
    callbackUrl,
    status: 'pending',
    retryCount: 0,
    lastAttempt: new Date(),
    failedBets: []
  });

  try {
    const response = await sendSettlement(payload, callbackUrl);
    const batch = batches.get(requestId);
    handleResponse(response, batch);
    batches.set(requestId, batch);

    if (batch.status === 'partial' || batch.status === 'failed') {
      await retryQueue.add('retry-settlement', { requestId }, { delay: RETRY_DELAY_BASE_MS });
    }
  } catch (err) {
    console.error(`Initial settlement failed for batch ${requestId}:${transactionId}`, err.message);
    const batch = batches.get(requestId);
    batch.status = 'failed';
    batch.retryCount++;
    batch.lastAttempt = new Date();
    batch.failedBets = payload.bets.winners
      .flatMap(b => b.client_bet_id)
      .concat(payload.bets.losers.flatMap(b => b.client_bet_id));
    batches.set(requestId, batch);
    let data ={
      request_id: requestId,
      transaction_id: transactionId,
      operator_id: operatorId,
      status: "failed",
      payload: payload,
      retry_count: 1,
      failed_bets: JSON.stringify(batch.failedBets),
      is_closed_type: isClosedType
    }
    createBetSettlementsEntry(data);
    await retryQueue.add('retry-settlement', { requestId }, { delay: RETRY_DELAY_BASE_MS });
  }
}
module.exports ={
    sendNewBatch
}