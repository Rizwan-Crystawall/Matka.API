const ResultModel = require("../modal/ResultModal");

const saveBetResults = async (data) => {
  console.log(data,"mi");
  
   if (!data.payload || !Array.isArray(data.payload)) {
    throw new Error("Invalid or missing 'payload' in request data");
  }

  if (!data.result || !Array.isArray(data.result)) {
    throw new Error("Invalid or missing 'result' in request data");
  }

  
  await ResultModel.insertOrUpdateResults(data.payload, data.user_id);

  for (const item of data.result) {
    const isClosedType = item.hasOwnProperty("open_result") ? 0 : 1;
    const digit = item.open_result ?? item.close_result;
    const mmid = item.mmid;

    const allBets = await ResultModel.fetchBetsWithDigitStats(digit, mmid, isClosedType);

    const result = Object.values(
      allBets.reduce((acc, curr) => {
        if (!acc[curr.user_id]) {
          acc[curr.user_id] = { user_id: curr.user_id, total_stake: 0, profit: null };
        }
        acc[curr.user_id].total_stake += curr.total_stake_against_bet;

        if (acc[curr.user_id].profit === null && curr.winning_potential_profit !== null) {
          acc[curr.user_id].profit = curr.winning_potential_profit;
        }
        return acc;
      }, {})
    );

    const winners = result.filter((entry) => entry.profit !== null);
    const losers = result.filter((entry) => entry.profit === null);

    for (const row of winners) {
      const { user_id, total_stake, profit } = row;
      const allTogetherProfit = profit + total_stake;
      await ResultModel.updateWinnerWallet(user_id, allTogetherProfit, total_stake);
    }

    for (const row of losers) {
      const { user_id, total_stake } = row;
      await ResultModel.updateLoserWallet(user_id, total_stake);
    }

    await ResultModel.closeBets(mmid, isClosedType);
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
  console.log("From service - result_id:", result_id); 
  
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

module.exports = { saveBetResults,getAllResults,getResultById,getActiveMatchesWithMarket };
