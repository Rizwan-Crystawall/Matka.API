// src/controller/betsController.js
const BetsService = require("../services/BetService");
const statusCodes = require("../utils/statusCodes");

const getBetsByMatchAndUser = async (req, res) => {
  try {
    const { match_id, user_id } = req.body;

    const result = await BetsService.fetchBetsByMatchAndUser(match_id, user_id);

    return res.status(200).json({
      success: true,
      message: "Bets fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// 

// For Operator API

const getBetsByMatchAndUserAPI = async (req, res) => {
  try {
    const { matchId, userId, operatorId } = req.params;

    const result = await BetsService.fetchBetsByMatchAndUserAPI(matchId, userId, operatorId);

    return res.status(200).json({
      status: "RS_OK",
      message: statusCodes.RS_OK,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getUserBets = async (req, res) => {
  try {
    const { match_id, user_id } = req.body;

    const bets = await BetsService.fetchUserBets(user_id, match_id);
    return res.status(200).json({ success: true, data: bets });
  } catch (err) {
    console.error("Error fetching user bets:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// For Operator API

const getUserBetsAPI = async (req, res) => {
  try {
    const { matchId, userId, operatorId } = req.params;

    const bets = await BetsService.fetchUserBetsAPI(userId, matchId, operatorId);
    return res.status(200).json({ status: "RS_OK", message:statusCodes.RS_OK, data: bets });
  } catch (err) {
    console.error("Error fetching user bets:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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

// For Operator API

const saveUserBetAPI = async (req, res) => {
  try {
    const result = await BetsService.saveUserBetAPI(req.body);

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
    const bets = await BetsService.fetchBetsByOperator();
    res.status(200).json({ success: true, data: bets });
  } catch (err) {
    console.error("Error fetching bets:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getOperators = async (req, res) => {
  try {
    const operatorIds = await BetsService.fetchOperatorIds();
    res.json({ operatorIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch operator ids" });
  }
};

const getDigitBetStats = async (req, res) => {
  try {
    const { matchTypeId } = req.query;
    // console.log("Received matchTypeId:", matchTypeId); // log to check value

    if (!matchTypeId) {
      return res.status(400).json({ error: "matchTypeId is required" });
    }

    const data = await BetsService.getDigitStatsByMatchType(matchTypeId);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching digit stats:", err);
    res.status(500).json({ error: err.message });
  }
};

const getUniqueClients = async (req, res) => {
  try {
    const clients = await BetsService.getUniqueClients(req.body.digit);
    res.json({ success: true, data: clients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch operator ids" });
  }
};

const getTotalNumberOfBets = async (req, res) => {
  try {
    const clients = await BetsService.getTotalNumberOfBets(req.body.digit);
    res.json({ success: true, data: clients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch operator ids" });
  }
};

const isThisBetPlacable = async (req, res) => {
  try {
    const betsPlace = await BetsService.isThisBetPlacable(req.body);
    if (betsPlace.success)
      res.status(200).json({ success: true, data: betsPlace.data });
    else res.status(404).json({ success: false, data: betsPlace.data });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Unable to place this Bet",
        error: "Unable to place this Bet",
      });
  }
};

module.exports = {
  getBetsByMatchAndUser,
  getUserBets,
  saveUserBet,
  saveUserBetAPI,
  getBetsByOperator,
  getOperators,
  getDigitBetStats,
  getUniqueClients,
  getTotalNumberOfBets,
  isThisBetPlacable,
  getBetsByMatchAndUserAPI,
  getUserBetsAPI,
};
