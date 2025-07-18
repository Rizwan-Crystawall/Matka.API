const ResultModel = require("../modal/ResultModal");

const saveBetResults = async (data) => {
  
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

  await ResultModel.insertOrUpdateResults(values);
  

  for (const item of data.result) {
    const isClosedType = item.hasOwnProperty("open_result") ? 0 : 1;
    const digit = item.open_result ?? item.close_result;
    const mmid = item.mmid;

    const bets = await ResultModel.fetchBets(digit, mmid, isClosedType);
    

    const grouped = Object.values(
      bets.reduce((acc, curr) => {
        if (!acc[curr.user_id]) {
          acc[curr.user_id] = {
            user_id: curr.user_id,
            total_stake: 0,
            profit: null,
          };
        }
        acc[curr.user_id].total_stake = parseInt(acc[curr.user_id].total_stake) + parseInt(curr.total_stake_against_bet);
        const amount=   parseInt(acc[curr.user_id].total_stake) + parseInt(curr.total_stake_against_bet);
        
        
        if (
          acc[curr.user_id].profit === null &&
          curr.winning_potential_profit !== null
        ) {
          acc[curr.user_id].profit = parseInt(curr.winning_potential_profit);
        }
        return acc;
      }, {})
    );

    const winners = grouped.filter((entry) => entry.profit !== null);
    const losers = grouped.filter((entry) => entry.profit === null);




    for (const row of winners) {
      const { user_id, total_stake, profit } = row;
      const totalProfit = profit + total_stake;
      await ResultModel.updateWinnerWallet(user_id, totalProfit, total_stake);
    }

    for (const row of losers) {
      const { user_id, total_stake } = row;
      await ResultModel.updateLoserWallet(user_id, total_stake);
    }

    await ResultModel.updateBetsStatus(mmid, isClosedType);
  }
};

const rollBackBetResult = async (data) => {
  const { mmid, isClosedType, digit } = data;

  try {
    const bets = await ResultModel.fetchRollbackBets(digit, mmid, isClosedType);

    if (!bets || bets.length === 0) {
      return {
        success: false,
        message: "No bets found to rollback.",
      };
    }

    const grouped = ResultModel.groupBetsByUser(bets);
    const winners = grouped.filter((u) => u.profit !== null);
    const losers = grouped.filter((u) => u.profit === null);

    for (const { user_id, total_stake, profit } of winners) {
      const rollbackAmount = profit + total_stake;
      await ResultModel.rollbackWinner(user_id, rollbackAmount, total_stake);
    }

    for (const { user_id, total_stake } of losers) {
      await ResultModel.rollbackLoser(user_id, total_stake);
    }

    await ResultModel.resetBetStatus(mmid, isClosedType);
    await ResultModel.clearResult(mmid, isClosedType);

    return {
      success: true,
      message: "Bet result rolled back successfully.",
    };
  } catch (err) {
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
    throw new Error('Invalid or missing match_id');
  }

  const rows= await ResultModel.fetchMatchTypeData(matchId);
  return rows;
};
const getMatchTypeId = async (match_id) => {
  if (!match_id || isNaN(match_id)) {
    throw new Error('Invalid match_id');
  }

  const result = await ResultModel.getMatchTypeResults(match_id);
  return result;
};



module.exports = { saveBetResults,rollBackBetResult,getAllResults,getResultById,getActiveMatchesWithMarket,fetchMatchTypeData,getMatchTypeId };
