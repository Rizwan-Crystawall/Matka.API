const express = require("express");
const router = express.Router();
const loginController = require("../controllers/logincontroller");
const usercontroller = require("../controllers/usercontroller");
const matchcontroller = require("../controllers/matchcontroller");
const registerController = require("../controllers/registercontroller");
const marketcontoller = require("../controllers/marketcontoller");
const dashboardcontroller = require("../controllers/dashboardcontroller");
const ResultController = require("../controllers/ResultController");
const WalletController = require("../controllers/WalletController");
const BetController = require("../controllers/BetController");

//Middlware
const authMiddleware = require("../middleware/middleware");

//Login
router.post("/user/login", loginController.login);
router.post("/register", registerController.register);
router.post("/admin/getusers", usercontroller.getAdminDashboardUsers);
router.post("/admin/add/user", usercontroller.registerUser);
router.post("/admin/update/user", usercontroller.updateUserController);
router.post("/delete/user", usercontroller.deleteUser);

//Match
router.post("/getmatch", authMiddleware, matchcontroller.getAllMatches);
router.post("/addmatch", authMiddleware, matchcontroller.addMatch);
router.post("/editmatch/:id", authMiddleware, matchcontroller.updateMatch);
router.post("/matches", matchcontroller.getMatchById);
router.delete("/deletematch/:id", authMiddleware, matchcontroller.deleteMatch);
router.post("/matchDetails", matchcontroller.getMatchTypes);

//MArket
router.post("/getmarket", authMiddleware, marketcontoller.getAllMarkets);
router.post("/getmarkets", authMiddleware, marketcontoller.getMarket);
router.post("/addmarket", authMiddleware, marketcontoller.addMarket);
router.post("/updatemarket", authMiddleware, marketcontoller.updateMarket);
router.post("/deletemarket", authMiddleware, marketcontoller.deleteMarket);
router.post("/activeMatchMmappings", authMiddleware,marketcontoller.getActiveMatchMappings);


//Dashboard
router.post("/totaldata", authMiddleware, dashboardcontroller.getDashboardData);
router.post("/dashboard/marketwise",authMiddleware,dashboardcontroller.getMarketwiseDashboardData);
router.post("/dashboard/bettype",authMiddleware,dashboardcontroller.getBetTypeDistribution);
router.post("/recent/matches",authMiddleware,dashboardcontroller.getRecentMatches);


//Results
router.post("/saveResults", authMiddleware, ResultController.saveBetResults);
router.post("/getAllResults", authMiddleware, ResultController.getAllResults);
router.post("/getResultById", authMiddleware, ResultController.getResultById);
router.post("/getMarketById", authMiddleware, ResultController.getMarketById);
router.post("/getMatchTypeResults",authMiddleware,ResultController.getMatchTypeResults); 
router.post("/getMatchTypeId", authMiddleware, ResultController.getMatchTypeId);



//Wallet
router.post("/wallet", authMiddleware, WalletController.getWalletDetails);


//BetUsers
router.post("/betUsers", authMiddleware, BetController.getBetsByMatchAndUser);
router.post("/betsUserLog", authMiddleware, BetController.getUserBets);
router.post("/saveUserBet", authMiddleware, BetController.saveUserBet);

module.exports = router;
