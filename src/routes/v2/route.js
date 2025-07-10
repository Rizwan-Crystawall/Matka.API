const express = require("express");
const router = express.Router();

const usercontroller = require("../../controllers/usercontroller");
const marketcontoller = require("../../controllers/marketcontoller");
const BetController = require("../../controllers/BetController");
const TokenController = require("../../controllers/TokenController");
const TransactionController = require("../../controllers/TransactionController");
const ResultController = require("../../controllers/ResultController");

// API Middleware
const authAPIMiddleware = require("../../middleware/apiMiddleware");

// Market for Operator API External
router.post("/auth/token", TokenController.authToken);
router.post("/verify-auth", authAPIMiddleware, TokenController.verifyAuth);
router.post("/activeMatchMmappings", marketcontoller.getActiveMatchMappings);
router.post("/saveUserBet", authAPIMiddleware, BetController.saveUserBetAPI);
router.post("/betUsers", BetController.getBetsByMatchAndUserAPI);
router.post("/betsUserLog", BetController.getUserBetsAPI);
router.post("/isThisBetPlacable", BetController.isThisBetPlacable);
router.post("/createTransaction", TransactionController.createTransaction);
router.post("/createWalletSnapshot", TransactionController.createWalletSnapshot);
router.post("/placebet", authAPIMiddleware, TransactionController.placeBet);
router.post("/resultpublish", authAPIMiddleware, ResultController.publishResults);

module.exports = router;