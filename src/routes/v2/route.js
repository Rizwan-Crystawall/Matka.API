const express = require("express");
const router = express.Router();
const marketcontoller = require("../../controllers/marketcontoller");
const BetController = require("../../controllers/BetController");
const TokenController = require("../../controllers/TokenController");
const TransactionController = require("../../controllers/TransactionController");
const ResultController = require("../../controllers/ResultController");
const MatchController = require("../../controllers/matchcontroller");
// API Middlewares
const authAPIMiddleware = require("../../middleware/apiMiddleware");
const authAPIMiddlewareGet = require("../../middleware/apiMiddlewareGet.js");
// Market for Operator API External
router.post("/auth/login", TokenController.authToken);
router.get("/matches/:operatorId/:userId", authAPIMiddlewareGet, marketcontoller.getActiveMatchMappingsAPI);
router.get("/match/:matchId/:operatorId/:userId", authAPIMiddlewareGet, MatchController.getMatchTypesAPI);
router.get("/bet/:userId/:matchId/:operatorId", authAPIMiddlewareGet, BetController.getBetsByMatchAndUserAPI);
router.get("/bet/digits/:userId/:matchId/:operatorId", authAPIMiddlewareGet, BetController.getUserBetsAPI);
router.post("/placebet", authAPIMiddleware, TransactionController.placeBet);
router.post("/resultpublish", ResultController.publishResults);
router.post("/rollbackrequest", ResultController.rollbackResults);
// router.post("/verify-auth", authAPIMiddleware, TokenController.verifyAuth);
// router.post("/saveUserBet", authAPIMiddleware, BetController.saveUserBetAPI);
// router.post("/betUsers", BetController.getBetsByMatchAndUserAPI);
// router.post("/betsUserLog", BetController.getUserBetsAPI);
// router.post("/isThisBetPlacable", BetController.isThisBetPlacable);
// router.post("/createTransaction", TransactionController.createTransaction);
// router.post("/createWalletSnapshot", TransactionController.createWalletSnapshot);
// router.post("/settlebetoperator", ResultController.settleBet)
module.exports = router;