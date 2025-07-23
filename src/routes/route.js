const express = require("express");
const router = express.Router();
const LoginController = require("../Controllers/LoginController");
const UserController = require("../Controllers/UserController");
const MatchController = require("../Controllers/MatchController");
const RegisterController = require("../Controllers/RegisterController");
const MarketController = require("../Controllers/MarketContoller");
const DashboardController = require("../Controllers/DashboardController");
const ResultController = require("../Controllers/ResultController");
const WalletController = require("../Controllers/Walletcontroller");
const BetController = require("../Controllers/Betcontroller");
const TokenController = require("../Controllers/TokenController");
const OperatorController = require("../Controllers/OperatorController");
const marketcontoller = require("../Controllers/MarketController");
const matchcontroller = require("../Controllers/MatchController");

//Middlware
const authMiddleware = require("../middleware/middleware");

// API Middleware
const authAPIMiddleware = require("../middleware/apiMiddleware");

//Login
router.post("/user/login", LoginController.login);
router.post("/register", RegisterController.register);

//User
router.get("/admin/getusers", UserController.getAdminDashboardUsers);
router.post("/admin/add/user", UserController.registerUser);
router.post("/admin/update/user", UserController.updateUserController);
router.post("/delete/user", UserController.deleteUser);

//Match
router.get("/getmatch", authMiddleware, MatchController.getAllMatches);
router.post("/addmatch", authMiddleware, MatchController.addMatch);
router.post("/editmatch/:id", authMiddleware, MatchController.updateMatch);
router.post("/matches", MatchController.getMatchById);
router.delete("/deletematch/:id", authMiddleware, MatchController.deleteMatch);
// router.get("/matchDetails", MatchController.getMatchTypes);
router.get("/matchTypes", MatchController.getAllMatchTypes);

//Market
router.post("/getmarket", authMiddleware, marketcontoller.getAllMarkets);
router.get("/markets", authMiddleware, marketcontoller.getMarket);
router.post("/getmarkets", authMiddleware, marketcontoller.getMarket);
router.post("/addmarket", authMiddleware, marketcontoller.addMarket);
router.post("/updatemarket", authMiddleware, marketcontoller.updateMarket);
router.post("/deletemarket", authMiddleware, marketcontoller.deleteMarket);
router.post("/activeMatchMmappings", authMiddleware,marketcontoller.getActiveMatchMappings);
router.get("/match", authMiddleware,marketcontoller.getActiveMatchMappings);
router.get("/match/:matchId", authMiddleware, matchcontroller.getMatchTypes);

// Market for Operator API Internal
router.post("/get-markets", MarketController.getMarketsByOperator);
router.post("/verify-user", UserController.verifyUser);

//Dashboard
router.post("/totaldata", authMiddleware, DashboardController.getDashboardData);
router.post("/dashboard/marketwise",authMiddleware,DashboardController.getMarketwiseDashboardData);
router.post("/dashboard/bettype",authMiddleware,DashboardController.getBetTypeDistribution);
router.post("/recent/matches",authMiddleware,DashboardController.getRecentMatches);

//Results
router.post("/results", authMiddleware, ResultController.saveBetResults);
router.post("/results/rollback",ResultController.rollbackBetResults);
router.get("/results", authMiddleware, ResultController.getAllResults);
router.post("/getResultById", authMiddleware, ResultController.getResultById);
router.post("/getMarketById", authMiddleware, ResultController.getMarketById);
router.post("/getMatchTypeResults",authMiddleware,ResultController.getMatchTypeResults); 
router.post("/getMatchTypeId", authMiddleware, ResultController.getMatchTypeId);

//Wallet
router.get("/wallet",WalletController.getWalletDetails);

//BetUsers
router.post("/bet", authMiddleware, BetController.getBetsByMatchAndUser);
router.get("/bet/details", authMiddleware, BetController.getUserBets);
router.post("/bet/save", authMiddleware, BetController.saveUserBet);
router.get("/getBetsByOperator",BetController.getBetsByOperator);
router.get('/getoperators', BetController.getOperators);
router.get("/digit-stats",BetController.getDigitBetStats);
router.post("/getUniqueClients", authMiddleware,BetController.getUniqueClients);
router.post("/getTotalNumberOfBets", authMiddleware,BetController.getTotalNumberOfBets);


//Operators
router.get('/operators', OperatorController.getOperators);
router.post('/operator', OperatorController.addOperators);
router.get('/operators/:id', OperatorController.getOperatorById);
router.post('/operator/:id', OperatorController.updateOperator);
router.delete('/deleteoperator/:id', OperatorController.deleteOperator);
router.post('/operator/status/:id', OperatorController.updateStatus);
router.get('/operator/:id/status', OperatorController. getStatusByOperatorId);
router.get('/operat/list', OperatorController.getOperatorList);





module.exports = router;