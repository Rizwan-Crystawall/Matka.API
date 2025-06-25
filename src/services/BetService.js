const BetsModal = require('../modal/BetModal');

const fetchBetsByMatchAndUser = async (matchId, userId) => {
  if (!matchId || isNaN(matchId)) {
    throw new Error('Invalid match ID');
  }
  if (!userId || isNaN(userId)) {
    throw new Error('Invalid user ID');
  }

  return await BetsModal.getBetsByMatchAndUser(matchId, userId);
};
const fetchUserBets = async (user_id, match_id) => {
  if (isNaN(user_id) || isNaN(match_id)) {
    throw new Error('Invalid IDs');
  }
  return await BetsModal.getUserBetsByMatch(user_id, match_id);
};
const saveUserBet = async (data) => {
  const matchMap = await BetsModal.getMatchMap(data.match_id, data.type_id);
  if (!matchMap) {
    throw new Error("Match type mapping not found.");
  }

  const betId = await BetsModal.insertBet({
    ...data,
    match_map_id: matchMap.id,
  });

  if (!data.digit || data.digit.length === 0) {
    throw new Error("No digits provided for the bet.");
  }  

  const digitData = data.digit.map((digit) => {
    const profit = data.results[digit] ?? 0;
    return { digit, bet_id: betId, potential_profit: profit };
  });

  await BetsModal.insertBetDigits(digitData);

  const existingDigits = await BetsModal.getExistingDigits({
    match_map_id: matchMap.id,
    user_id: data.user_id,
    is_closed_type: data.is_closed_type,
  });



  for (const row of existingDigits) {
    const digit = row.digit.toString();
    if (digit in data.results) {
      const profit = parseInt(data.results[digit]);
      await BetsModal.updateDigitProfit(row.id, profit);
    }
  }

  await BetsModal.updateWallet(data.user_id, data.amount);

  return { bet_id: betId };
};
module.exports = {
  fetchBetsByMatchAndUser,
  fetchUserBets,
  saveUserBet
};