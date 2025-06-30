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
const saveUserBet = async (req, res) => {
  try {
    const result = await BetsService.saveUserBet(req.body);

    res.status(200).json({
      success: true,
      message: "Bet saved successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getBetsByOperator = async (req, res) => {
  try {
    const operatorId = req.body.operator_id; 
    const bets = await BetsService.fetchBetsByOperator(operatorId);
    res.status(200).json({ success: true, data: bets });
  } catch (err) {
    console.error('Error fetching bets:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
const getOperators = async (req, res) => {
  try {
    const operatorIds = await BetsService.fetchOperatorIds();
    res.json({ operatorIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch operator ids' });
  }
};

module.exports = {
  getBetsByMatchAndUser,
  getUserBets,
  saveUserBet,
  getBetsByOperator,
  getOperators
};