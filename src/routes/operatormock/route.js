const express = require("express");
const router = express.Router();

const usercontroller = require("../../controllers/usercontroller");
const marketcontoller = require("../../controllers/marketcontoller");
const BetController = require("../../controllers/BetController");
const TokenController = require("../../controllers/TokenController");

// API Middleware
const authAPIMiddleware = require("../../middleware/apiMiddleware");

// Market for Operator API External
router.post("/auth/token", TokenController.authToken);
router.post("/verify-auth", authAPIMiddleware, TokenController.verifyAuth);
router.post("/op/activeMatchMmappings", marketcontoller.getActiveMatchMappings);
router.post("/op/saveUserBet", BetController.saveUserBetAPI);
router.post("/op/betUsers", BetController.getBetsByMatchAndUser);
router.post("/op/betsUserLog", BetController.getUserBets);
router.post("/isThisBetPlacable", authAPIMiddleware, BetController.isThisBetPlacable);

module.exports = router;