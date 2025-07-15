const express = require("express");
const router = express.Router();

const usercontroller = require("../../controllers/usercontroller");
const marketcontoller = require("../../controllers/marketcontoller");
const BetController = require("../../controllers/BetController");
const TokenController = require("../../controllers/TokenController");
const TransactionController = require("../../controllers/TransactionController");
const ResultController = require("../../controllers/ResultController");
const MatchController = require("../../controllers/matchcontroller");

// API Middleware
const authAPIMiddleware = require("../../middleware/apiMiddleware");

// Market for Operator API External
router.post("/auth/login", TokenController.authToken);
router.post("/verify-auth", authAPIMiddleware, TokenController.verifyAuth);

router.get("/matches", marketcontoller.getActiveMatchMappings);
router.get("/match/:matchId", MatchController.getMatchTypes);

router.post("/saveUserBet", authAPIMiddleware, BetController.saveUserBetAPI);
router.post("/betUsers", BetController.getBetsByMatchAndUserAPI);
router.post("/betsUserLog", BetController.getUserBetsAPI);

router.get("/bet/:userId/:matchId/:operatorId", BetController.getBetsByMatchAndUserAPI);
router.get("/bet/digits/:userId/:matchId/:operatorId", BetController.getUserBetsAPI);

router.post("/isThisBetPlacable", BetController.isThisBetPlacable);
router.post("/createTransaction", TransactionController.createTransaction);
router.post("/createWalletSnapshot", TransactionController.createWalletSnapshot);
router.post("/placebet", authAPIMiddleware, TransactionController.placeBet);

router.post("/resultpublish", ResultController.publishResults);
router.post("/settlebetoperator", ResultController.settleBet)

router.post("/rollbackrequest", ResultController.rollbackResults);

module.exports = router;