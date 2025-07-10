const db = require("../utils/dbHelper");
const ResultModel = require("../modal/ResultModal");

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
      const mmid = item.mmid;
      const bets = await ResultModel.fetchBets(
        connection,
        digit,
        mmid,
        isClosedType
      );

      // UUID values for each response
      const token = "f562a685-a160-4d17-876d-ab3363db331c";
      const requestId = "583c985f-fee6-4c0e-bbf5-308aad6265af";
      const transactionId = "tx-16d2dcfe-b89e-11e7-854a-58404eea6d16";

      // Step 1: Group by operator_id → user_id
      const operatorsMap = {};

      for (const bet of bets) {
        const opId = bet.operator_id;
        const userId = bet.user_id;
        const betId = bet.bet_id;

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

      // Step 2: Build final grouped array per operator
      const finalOutput = Object.entries(operatorsMap).map(
        ([opId, usersMap]) => {
          const winners = [];
          const losers = [];

          for (const [userId, user] of Object.entries(usersMap)) {
            const bet_id = [...user.bet_ids].join(",");

            if (user.hasWin) {
              winners.push({
                userId,
                profit: user.profit,
                stake: user.stake,
                bet_id,
              });
            } else {
              losers.push({
                userId,
                stake: user.stake,
                bet_id,
              });
            }
          }

          return {
            operatorId: opId,
            token,
            requestId,
            transactionId,
            bets: {
              winners,
              Loosers: losers,
            },
          };
        }
      );
      // console.log("RESULTS");
      let finalReports = JSON.stringify(finalOutput, null, 2);
      // console.log(finalReports);

      const OperatorUrls = await ResultModel.getOperatorUrls();

      // const finalOutput = [
      //   /* your data here */
      // ];

      finalOutput.forEach((operator) => {
        console.log(`Operator ID: ${operator.operatorId}`);
        console.log(`Token: ${operator.token}`);
        console.log(`Transaction ID: ${operator.transactionId}`);

        // Winners
        console.log("Winners:");
        operator.bets.winners.forEach((winner) => {
          console.log(
            `  User: ${winner.userId}, Profit: ${winner.profit}, Stake: ${winner.stake}, Bets: ${winner.bet_id}`
          );
        });

        // Losers
        console.log("Losers:");
        operator.bets.Loosers.forEach((loser) => {
          console.log(
            `  User: ${loser.userId}, Stake: ${loser.stake}, Bets: ${loser.bet_id}`
          );
        });

        console.log("-------------------------");
      });

      // console.log("OPERATOR URLs");
      // console.log(OperatorUrls);

      // await sendReportsToOperators(JSON.stringify(finalOutput, null, 2), OperatorUrls);

      // async function sendReportsToOperators(reports, OperatorUrls) {
      //   for (const report of reports) {
      //     console.log("Report")
      //     console.log(report)
      //     const callbackUrl = OperatorUrls[report.operatorId];

      //     console.log(callbackUrl);

      //     if (!callbackUrl) {
      //       console.warn(
      //         `⚠️ No callback URL for operator ${report.operatorId}`
      //       );
      //       continue;
      //     }

      //     try {
      //       const res = await fetch(callbackUrl, {
      //         method: "POST",
      //         headers: {
      //           "Content-Type": "application/json",
      //           Authorization: `Bearer ${report.token}`, // optional if required by operator
      //         },
      //         body: JSON.stringify(report),
      //       });

      //       const result = await res.text(); // could also be .json()
      //       console.log(
      //         `✅ Sent to operator ${report.operatorId}: ${res.status} - ${result}`
      //       );
      //     } catch (error) {
      //       console.error(
      //         `❌ Failed to send to operator ${report.operatorId}:`,
      //         error.message
      //       );
      //     }
      //   }
      // }

      // const grouped = Object.values(summaryByUser);
      // const winners = grouped.filter((user) => user.profit !== null);
      // const losers = grouped.filter((user) => user.profit === null);

      // for (const row of winners) {
      //   const { user_id, total_stake, profit } = row;
      //   const totalProfit = profit + total_stake;
      //   await ResultModel.updateWinnerWallet(
      //     connection,
      //     user_id,
      //     totalProfit,
      //     total_stake
      //   );
      // }
      // for (const row of losers) {
      //   const { user_id, total_stake } = row;
      //   await ResultModel.updateLoserWallet(connection, user_id, total_stake);
      // }
      // await ResultModel.updateBetsStatus(connection, mmid, isClosedType);
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

module.exports = {
  saveBetResults,
  rollBackBetResult,
  getAllResults,
  getResultById,
  getActiveMatchesWithMarket,
  fetchMatchTypeData,
  getMatchTypeId,
  publishResults,
};
