const { v4: uuidv4 } = require("uuid");
// const fetch = require("node-fetch");
const axios = require("axios");
const db = require("../utils/dbHelper");
const ResultModel = require("../modal/ResultModal");
const { sendNewBatch } = require("../utils/retry.js");
const { sendNewBatchForRollback } = require("../utils/retry_rollback");
const TokenModal = require("../modal/TokenModal");
const { generateSignature } = require("./../utils/security");
const jwt = require("jsonwebtoken");
const { createTransaction } = require("../modal/TransactionModal.js");
const TYPE_NAMES = require("../utils/typeMap");

const saveBetResults = async (data) => {
  const connection = await db.beginTransaction();
  try {
    if (!data || !Array.isArray(data.payload)) {
      throw new Error("Invalid data: payload must be an array.");
    }
    if (!Array.isArray(data.result)) {
      throw new Error("Invalid data: result must be an array.");
    }
    const values = data.payload.map((r) => [
      r.mmid,
      r.open_result,
      r.close_result,
      data.user_id,
    ]);
    await ResultModel.insertOrUpdateResults(connection, values);
    for (const item of data.result) {
      const isClosedType = item.hasOwnProperty("open_result") ? 0 : 1;
      const digit = item.open_result ?? item.close_result;
      const mmid = item.mmid;
      const bets = await ResultModel.fetchBets(
        connection,
        digit,
        mmid,
        isClosedType
      );

      const summaryByUser = bets.reduce((acc, curr) => {
        const userId = curr.user_id;

        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            total_stake: 0,
            profit: null,
          };
        }

        acc[userId].total_stake += parseFloat(curr.stake);

        if (
          acc[userId].profit === null &&
          curr.winning_potential_profit !== null
        ) {
          acc[userId].profit = parseFloat(curr.winning_potential_profit);
        }

        return acc;
      }, {});

      const grouped = Object.values(summaryByUser);
      const winners = grouped.filter((user) => user.profit !== null);
      const losers = grouped.filter((user) => user.profit === null);

      for (const row of winners) {
        const { user_id, total_stake, profit } = row;
        const totalProfit = profit + total_stake;
        await ResultModel.updateWinnerWallet(
          connection,
          user_id,
          totalProfit,
          total_stake
        );
      }
      for (const row of losers) {
        const { user_id, total_stake } = row;
        await ResultModel.updateLoserWallet(connection, user_id, total_stake);
      }
      await ResultModel.updateBetsStatus(connection, mmid, isClosedType);
    }
    await db.commit(connection);
    return {
      success: true,
      message: "Bet results saved successfully.",
    };
  } catch (error) {
    await db.rollback(connection);
    console.error("Error saving bet results:", error);
    return {
      success: false,
      message: "Failed to save bet results.",
      error: error.message,
    };
  }
};
const rollBackBetResult = async (data) => {
  const connection = await db.beginTransaction();
  try {
    const { mmid, isClosedType, digit } = data;
    const bets = await ResultModel.fetchRollbackBets(
      connection,
      digit,
      mmid,
      isClosedType
    );
    if (!bets || bets.length === 0) {
      await ResultModel.clearResult(connection, mmid, isClosedType);
      await db.commit(connection);
      return {
        success: true,
        message: "Bet result rolled back successfully.",
      };
    }
    const grouped = ResultModel.groupBetsByUser(bets);
    const winners = grouped.filter((u) => u.profit !== null);
    const losers = grouped.filter((u) => u.profit === null);
    for (const { user_id, total_stake, profit } of winners) {
      const rollbackAmount = profit + total_stake;
      await ResultModel.rollbackWinner(
        connection,
        user_id,
        rollbackAmount,
        total_stake
      );
    }
    for (const { user_id, total_stake } of losers) {
      await ResultModel.rollbackLoser(connection, user_id, total_stake);
    }
    await ResultModel.resetBetStatus(connection, mmid, isClosedType);
    await ResultModel.clearResult(connection, mmid, isClosedType);
    await db.commit(connection);
    return {
      success: true,
      message: "Bet result rolled back successfully.",
    };
  } catch (err) {
    await db.rollback(connection);
    console.error("Rollback error:", err);
    return {
      success: false,
      message: "Failed to rollback bet result.",
      error: err.message,
    };
  }
};
const getAllResults = async () => {
  const results = await ResultModel.getAllResults();

  if (!results || results.length === 0) {
    throw new Error("No results found.");
  }

  return results;
};
const getResultById = async (result_id) => {
  // console.log("From service - result_id:", result_id);

  // Validation
  if (!result_id || isNaN(result_id)) {
    return {
      status: 400,
      success: false,
      message: "Invalid or missing result_id",
    };
  }

  try {
    const result = await ResultModel.fetchResultByMatchId(result_id);

    return {
      status: 200,
      success: true,
      message: "Results fetched successfully",
      data: result,
    };
  } catch (error) {
    console.error("Service Error:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to fetch results",
    };
  }
};
const getActiveMatchesWithMarket = async () => {
  try {
    const result = await ResultModel.fetchMarketByMatchId();
    return result;
  } catch (err) {
    throw {
      statusCode: 500,
      message: "Failed to fetch match data",
    };
  }
};
const fetchMatchTypeData = async (matchId) => {
  if (!matchId || isNaN(matchId)) {
    throw new Error("Invalid or missing match_id");
  }

  const rows = await ResultModel.fetchMatchTypeData(matchId);
  return rows;
};
const getMatchTypeId = async (match_id) => {
  if (!match_id || isNaN(match_id)) {
    throw new Error("Invalid match_id");
  }

  const result = await ResultModel.getMatchTypeResults(match_id);
  return result;
};

// For Operator API

const publishResults = async (data) => {
  const connection = await db.beginTransaction();
  try {
    if (!data || !Array.isArray(data.payload)) {
      throw new Error("Invalid data: payload must be an array.");
    }
    if (!Array.isArray(data.result)) {
      throw new Error("Invalid data: result must be an array.");
    }
    const values = data.payload.map((r) => [
      r.mmid,
      r.open_result,
      r.close_result,
      data.user_id,
    ]);
    await ResultModel.insertOrUpdateResults(connection, values);
    for (const item of data.result) {
      const isClosedType = item.hasOwnProperty("open_result") ? 0 : 1;
      const digit = item.open_result ?? item.close_result;
      const typeName = TYPE_NAMES[item.type_id] || "Unknown";
      const mmid = item.mmid;
      const bets = await ResultModel.fetchBetsAPI(
        connection,
        digit,
        mmid,
        isClosedType
      );
      const operatorsMap = {};
      for (const bet of bets) {
        const opId = bet.operator_id;
        const userId = bet.user_id;
        const betId = bet.client_bet_id;
        if (!operatorsMap[opId]) {
          operatorsMap[opId] = {};
        }
        if (!operatorsMap[opId][userId]) {
          operatorsMap[opId][userId] = {
            stake: 0,
            profit: null,
            bet_ids: new Set(),
            hasWin: false,
          };
        }
        const user = operatorsMap[opId][userId];
        user.stake += parseFloat(bet.stake);
        user.bet_ids.add(betId);
        if (user.profit === null && bet.winning_potential_profit !== null) {
          user.profit = parseFloat(bet.winning_potential_profit);
          user.hasWin = true;
        }
      }
      const finalOutput = Object.entries(operatorsMap).map(
        ([opId, usersMap]) => {
          const winners = [];
          const losers = [];
          for (const [userId, user] of Object.entries(usersMap)) {
            const bet_ids = [...user.bet_ids].map(Number);
            if (user.hasWin) {
              const creditAmount = user.profit + user.stake;
              winners.push({
                userId,
                profit: user.profit,
                stake: user.stake,
                creditAmount,
                bet_ids,
              });
            } else {
              losers.push({
                userId,
                stake: user.stake,
                bet_ids,
              });
            }
          }
          return {
            operatorId: opId,
            bets: {
              winners,
              Loosers: losers,
            },
          };
        }
      );
      let finalReports = JSON.stringify(finalOutput, null, 2);
      const OperatorUrls = await ResultModel.getOperatorUrlsForResult();
      const transactionId = "txn-" + uuidv4();
      for (const operator of finalOutput) {
        const requestId = uuidv4();
        const timestamp = new Date().toISOString();
        const formattedWinners = operator.bets.winners.map((winner) => ({
          userId: winner.userId,
          creditAmount: winner.creditAmount,
          totalstake: winner.stake,
          clientBetId: winner.bet_ids,
        }));
        const formattedLosers = operator.bets.Loosers.map((loser) => ({
          userId: loser.userId,
          totalstake: loser.stake,
          clientBetId: loser.bet_ids,
        }));
        let userForToken = "";
        if (formattedWinners.length > 0) {
          userForToken = formattedWinners[0].userId;
        } else {
        }
        if (formattedLosers.length > 0) {
          userForToken = formattedLosers[0].userId;
        } else {
        }
        const oid = operator.operatorId;
        const opr = await TokenModal.getOperatorDetails(oid);
        let secret = "";
        if (opr.length > 0) {
          secret = opr[0].shared_secret;
        }
        const payloadForToken = {
          oid,
          userForToken,
          signature: generateSignature(userForToken, secret),
          iat: Math.floor(Date.now() / 1000),
        };
        const token = jwt.sign(payloadForToken, secret, {
          algorithm: "HS256",
          expiresIn: "1h",
        });
        // const formattedWinners = operator.bets.winners.flatMap((winner) =>
        //   winner.bet_ids.map((betId) => ({
        //     userId: winner.userId,
        //     creditAmount: winner.creditAmount,
        //     client_bet_id: betId,
        //   }))
        // );
        // const formattedLosers = operator.bets.Loosers.flatMap((loser) =>
        //   loser.bet_ids.map((betId) => ({
        //     userId: loser.userId,
        //     totalstake: loser.stake,
        //     client_bet_id: betId,
        //   }))
        // );
        let data = {
          userId: userForToken,
          transactionId: transactionId,
          requestId: requestId,
          operatorId: operator.operatorId,
          transType: "Result",
          debitAmount: 0,
        };
        await createTransaction(data);
        const payload = {
          operatorId: operator.operatorId,
          token: token,
          userId: userForToken,
          requestId,
          transactionId,
          winningDigit: digit,
          betType: typeName,
          bets: {
            winners: formattedWinners,
            losers: formattedLosers,
          },
          timestamp,
        };
        const callbackUrl = OperatorUrls[operator.operatorId];
        // console.log(callbackUrl);return;
        // console.log(JSON.stringify(payload, null, 2));
        await sendNewBatch(payload, callbackUrl);
        // console.log("----------------------------");
      }
      const groupedByBetId = {};
      bets.forEach((item) => {
        if (!groupedByBetId[item.bet_id]) {
          groupedByBetId[item.bet_id] = [];
        }
        groupedByBetId[item.bet_id].push(item);
      });
      const winningBets = [];
      const losingBets = [];
      for (const betId in groupedByBetId) {
        const entries = groupedByBetId[betId];
        const hasWinning = entries.some(
          (entry) => entry.winning_potential_profit !== null
        );
        if (hasWinning) {
          winningBets.push(parseInt(betId));
        } else {
          losingBets.push(parseInt(betId));
        }
      }
      await ResultModel.updateBetsStatusAPI(
        connection,
        winningBets,
        losingBets
      );
    }
    await db.commit(connection);
    return {
      success: true,
      message: "Bet results saved successfully.",
    };
  } catch (error) {
    await db.rollback(connection);
    console.error("Error saving bet results:", error);
    return {
      success: false,
      message: "Failed to save bet results.",
      error: error.message,
    };
  }
};

// For Operator API

const rollbackResults = async (data) => {
  const connection = await db.beginTransaction();
  try {
    if (!data || !Array.isArray(data.payload)) {
      throw new Error("Invalid data: payload must be an array.");
    }
    if (!Array.isArray(data.result)) {
      throw new Error("Invalid data: result must be an array.");
    }
    const values = data.payload.map((r) => [
      r.mmid,
      r.open_result,
      r.close_result,
      data.user_id,
    ]);
    
    for (const item of data.result) {
      const isClosedType = item.hasOwnProperty("open_result") ? 0 : 1;
      const digit = item.open_result ?? item.close_result;
      const typeName = TYPE_NAMES[item.type_id] || "Unknown";
      const mmid = item.mmid;
      const bets = await ResultModel.fetchBetsAPIForROllback(
        connection,
        digit,
        mmid,
        isClosedType
      );
      const operatorsMap = {};
      for (const bet of bets) {
        const opId = bet.operator_id;
        const userId = bet.user_id;
        const betId = bet.client_bet_id;
        if (!operatorsMap[opId]) {
          operatorsMap[opId] = {};
        }
        if (!operatorsMap[opId][userId]) {
          operatorsMap[opId][userId] = {
            stake: 0,
            profit: null,
            bet_ids: new Set(),
            hasWin: false,
          };
        }
        const user = operatorsMap[opId][userId];
        user.stake += parseFloat(bet.stake);
        user.bet_ids.add(betId);
        if (user.profit === null && bet.winning_potential_profit !== null) {
          user.profit = parseFloat(bet.winning_potential_profit);
          user.hasWin = true;
        }
      }
      const finalOutput = Object.entries(operatorsMap).map(
        ([opId, usersMap]) => {
          const winners = [];
          const losers = [];
          for (const [userId, user] of Object.entries(usersMap)) {
            const bet_ids = [...user.bet_ids].map(Number);
            if (user.hasWin) {
              const creditAmount = user.profit + user.stake;
              winners.push({
                userId,
                profit: user.profit,
                stake: user.stake,
                creditAmount,
                bet_ids,
              });
            } else {
              losers.push({
                userId,
                stake: user.stake,
                bet_ids,
              });
            }
          }
          return {
            operatorId: opId,
            bets: {
              winners,
              Loosers: losers,
            },
          };
        }
      );
      let finalReports = JSON.stringify(finalOutput, null, 2);
      const OperatorUrls = await ResultModel.getOperatorUrlsForRollback();
      const transactionId = "txn-" + uuidv4();
      for (const operator of finalOutput) {
        const requestId = uuidv4();
        const timestamp = new Date().toISOString();
        const formattedWinners = operator.bets.winners.map((winner) => ({
          userId: winner.userId,
          rollbackAmount: winner.creditAmount,
          totalstake: winner.stake,
          clientBetId: winner.bet_ids,
        }));
        const formattedLosers = operator.bets.Loosers.map((loser) => ({
          userId: loser.userId,
          totalstake: loser.stake,
          clientBetId: loser.bet_ids,
        }));
        let userForToken = "";
        if (formattedWinners.length > 0) {
          userForToken = formattedWinners[0].userId;
        } else {
        }
        if (formattedLosers.length > 0) {
          userForToken = formattedLosers[0].userId;
        } else {
        }
        const oid = operator.operatorId;
        const opr = await TokenModal.getOperatorDetails(oid);
        let secret = "";
        if (opr.length > 0) {
          secret = opr[0].shared_secret;
        }
        const payloadForToken = {
          oid,
          userForToken,
          signature: generateSignature(userForToken, secret),
          iat: Math.floor(Date.now() / 1000),
        };
        const token = jwt.sign(payloadForToken, secret, {
          algorithm: "HS256",
          expiresIn: "1h",
        });

        let data = {
          userId: userForToken,
          transactionId: transactionId,
          requestId: requestId,
          operatorId: operator.operatorId,
          transType: "Rollback",
          debitAmount: 0,
        };
        await createTransaction(data);
        const payload = {
          operatorId: operator.operatorId,
          token: token,
          userId: userForToken,
          requestId,
          transactionId,
          winningDigit: digit,
          betType: typeName,
          bets: {
            winners: formattedWinners,
            losers: formattedLosers,
          },
          timestamp,
        };
        const callbackUrl = OperatorUrls[operator.operatorId];
        await sendNewBatchForRollback(payload, callbackUrl);
      }
      const groupedByBetId = {};
      bets.forEach((item) => {
        if (!groupedByBetId[item.bet_id]) {
          groupedByBetId[item.bet_id] = [];
        }
        groupedByBetId[item.bet_id].push(item);
      });
      const winningBets = [];
      const losingBets = [];
      for (const betId in groupedByBetId) {
        const entries = groupedByBetId[betId];
        const hasWinning = entries.some(
          (entry) => entry.winning_potential_profit !== null
        );
        if (hasWinning) {
          winningBets.push(parseInt(betId));
        } else {
          losingBets.push(parseInt(betId));
        }
      }
      await ResultModel.resetBetStatus(connection, mmid, isClosedType);
    }
    await ResultModel.insertOrUpdateResults(connection, values);
    await db.commit(connection);
    return {
      success: true,
      message: "Bet results saved successfully.",
    };
  } catch (error) {
    await db.rollback(connection);
    console.error("Error saving bet results:", error);
    return {
      success: false,
      message: "Failed to save bet results.",
      error: error.message,
    };
  }
};

const settleBet = async (data) => {
  if (data.debit_amount < 1000) {
    return {
      success: true,
      data: { can_place_bet: true, balance: 1500, exposure: 200, bet_id: 15 },
    };
  } else {
    return {
      success: false,
      data: { can_place_bet: false, message: "Insufficient Fund" },
    };
  }
};

module.exports = {
  saveBetResults,
  rollBackBetResult,
  getAllResults,
  getResultById,
  getActiveMatchesWithMarket,
  fetchMatchTypeData,
  getMatchTypeId,
  publishResults,
  rollbackResults,
  settleBet,
};
