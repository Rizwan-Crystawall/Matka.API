const db = require("../utils/dbHelper");
const BetsModal = require("../modal/BetModal");

const fetchBetsByMatchAndUser = async (matchId, userId) => {
  if (!matchId || isNaN(matchId)) {
    throw new Error("Invalid match ID");
  }
  if (!userId || isNaN(userId)) {
    // throw new Error("Invalid user ID");
  }

  return await BetsModal.getBetsByMatchAndUser(matchId, userId);
};
const fetchUserBets = async (user_id, match_id) => {
  if (isNaN(user_id) || isNaN(match_id)) {
    // throw new Error("Invalid IDs");
  }
  return await BetsModal.getUserBetsByMatch(user_id, match_id);
};
const saveUserBet = async (data) => {
  // console.log(data);
  const connection = await db.beginTransaction();
  try {
    const matchMap = await BetsModal.getMatchMap(
      connection,
      data.match_id,
      data.type_id
    );
    // console.log(matchMap.id);
    if (!matchMap) {
      throw new Error("Match type mapping not found.");
    }
    const betId = await BetsModal.insertBet(connection, {
      ...data,
      match_map_id: matchMap.id,
    });
    // console.log(betId);
    // console.log(data.results);
    if (!data.digit || data.digit.length === 0) {
      throw new Error("No digits provided for the bet.");
    }

    // const digitData = data.digit.map((digit,stake) => {
    //   const profit = parseFloat(data.results[digit]) ?? 0;
    //   return { digit, bet_id: betId,stake, potential_profit: profit };
    // });

    const digitData = Object.entries(data.digit).map(([digit,stake]) => {
      const profit = data.results[digit] ?? 0;
      return { digit, bet_id: betId, stake, potential_profit: profit };
    });

    // console.log("53 " + digitData);

    await BetsModal.insertBetDigits(connection, digitData);
    const existingDigits = await BetsModal.getExistingDigits(connection, {
      is_closed_type: data.is_closed_type,
      match_map_id: matchMap.id,
      user_id: data.user_id,
    });
    // console.log("Existing Digits: " + existingDigits)
    for (const row of existingDigits[0]) {
      const digit = row.digit.toString();
      if (digit in data.results) {
        const profit = parseFloat(data.results[digit]);
        await BetsModal.updateDigitProfit(connection, row.id, profit);
      }
    }
    await BetsModal.updateWallet(connection, data.user_id, data.amount);
    await db.commit(connection);
    return { bet_id: betId };
  } catch (error) {
    await db.rollback(connection);
    throw error;
  }
};
const fetchBetsByOperator = async () => {
  const bets = await BetsModal.getBetsByOperatorId();
  return bets || [];
};

const fetchOperatorIds = async () => {
  const operators = await BetsModal.getOperatorIds();
  return operators;
};
const saveUserBetAPI = async (data) => {
  const connection = await db.beginTransaction();
  try {
    const matchMap = await BetsModal.getMatchMap(
      connection,
      data.match_id,
      data.type_id
    );
    if (!matchMap) {
      throw new Error("Match type mapping not found.");
    }
    const betId = await BetsModal.insertBetAPI(connection, {
      ...data,
      match_map_id: matchMap.id,
    });
    if (!data.digit || data.digit.length === 0) {
      throw new Error("No digits provided for the bet.");
    }
    const digitData = data.digit.map((digit) => {
      const profit = parseFloat(data.results[digit]) ?? 0;
      return { digit, bet_id: betId, potential_profit: profit };
    });
    await BetsModal.insertBetDigits(connection, digitData);
    const existingDigits = await BetsModal.getExistingDigits(connection, {
      is_closed_type: data.is_closed_type,
      match_map_id: matchMap.id,
      user_id: data.user_id,
    });
    for (const row of existingDigits[0]) {
      const digit = row.digit.toString();
      if (digit in data.results) {
        const profit = parseFloat(data.results[digit]);
        await BetsModal.updateDigitProfit(connection, row.id, profit);
      }
    }
    await BetsModal.updateWallet(connection, data.user_id, data.amount);
    await db.commit(connection);
    return { bet_id: betId };
  } catch (error) {
    await db.rollback(connection);
    throw error;
  }
};

const getDigitStatsByMatchType = async (matchTypeId) => {
  return await BetsModal.fetchDigitStats(matchTypeId);
};

const getUniqueClients = async (digit) => {
  return await BetsModal.getUniqueClients(digit);
};

const getTotalNumberOfBets = async (digit) => {
  return await BetsModal.getTotalNumberOfBets(digit);
};

module.exports = {
  getDigitStatsByMatchType,
  fetchBetsByMatchAndUser,
  fetchUserBets,
  saveUserBet,
  saveUserBetAPI,
  fetchBetsByOperator,
  fetchOperatorIds,
  getUniqueClients,
  getTotalNumberOfBets,
};
