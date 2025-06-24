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

module.exports = {
  fetchBetsByMatchAndUser,
  fetchUserBets
};