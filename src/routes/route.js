const express = require('express');
const router = express.Router();
const loginController = require('../controllers/logincontroller');
const usercontroller =  require('../controllers/usercontroller');
const matchcontroller =  require('../controllers/matchcontroller');
const registerController =  require('../controllers/registercontroller');
const marketcontoller =  require('../controllers/marketcontoller');
const dashboardcontroller =   require('../controllers/dashboardcontroller');
const ResultController =   require('../controllers/ResultController');
const WalletController = require('../controllers/WalletController');
const BetController = require('../controllers/BetController');



const authMiddleware = require('../middleware/middleware');

router.post('/user/login', loginController.login);
router.post("/register", registerController.register);
router.post('/admin/getusers',usercontroller.getAdminDashboardUsers);
router.post('/admin/add/user',usercontroller.registerUser);
router.post('/admin/update/user',usercontroller.updateUserController);
router.post("/delete/user", usercontroller.deleteUser);


 router.post('/getmatch',authMiddleware,matchcontroller.getAllMatches);
 router.post('/addmatch', authMiddleware,matchcontroller.addMatch); 
 router.post('/editmatch/:id', authMiddleware,matchcontroller.updateMatch);
 router.post('/matches', matchcontroller.getMatchById); 
 router.delete('/deletematch/:id', authMiddleware,matchcontroller.deleteMatch);
 router.post('/matchDetails', matchcontroller.getMatchTypes);



  router.post('/getmarket', marketcontoller.getAllMarkets);
  router.post('/getmarkets', marketcontoller.getMarket);
  router.post('/addmarket', marketcontoller.addMarket);
  router.post("/updatemarket", marketcontoller.updateMarket);
  router.post("/deletemarket", marketcontoller.deleteMarket);
  router.post('/activeMatchMmappings', marketcontoller.getActiveMatchMappings);



  router.post('/totaldata',authMiddleware,dashboardcontroller.getDashboardData);
  router.post("/dashboard/marketwise",authMiddleware, dashboardcontroller.getMarketwiseDashboardData);
  router.post("/dashboard/bettype",authMiddleware, dashboardcontroller.getBetTypeDistribution);
  router.post("/recent/matches", authMiddleware,dashboardcontroller.getRecentMatches);


  
    router.post('/saveResults',ResultController.saveBetResults);
    router.post('/getAllResults',ResultController.getAllResults);
    router.post('/getResultById', ResultController.getResultById);
    router.post('/getMarketById', ResultController.getMarketById);
    router.post('/getMatchTypeResults', ResultController.getMatchTypeResults);
    router.post('/getMatchTypeId', ResultController.getMatchTypeId);

    
router.post('/wallet', WalletController.getWalletDetails);

router.post('/betUsers', BetController.getBetsByMatchAndUser);
router.post('/betsUserLog', BetController.getUserBets);






    







module.exports = router;
