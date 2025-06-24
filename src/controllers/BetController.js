// src/controller/betsController.js
const BetsService = require('../services/BetService');

const getBetsByMatchAndUser = async (req, res) => {
  try {
    const { match_id, user_id } = req.body;

    const result = await BetsService.fetchBetsByMatchAndUser(match_id, user_id);

    return res.status(200).json({
      success: true,
      message: 'Bets fetched successfully',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};
const getUserBets = async (req, res) => {
  try {
    const { match_id,user_id } = req.body;

   

    const bets = await BetsService.fetchUserBets(user_id, match_id);
    return res.status(200).json({ success: true, data: bets });
  } catch (err) {
    console.error('Error fetching user bets:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getBetsByMatchAndUser,
  getUserBets
};