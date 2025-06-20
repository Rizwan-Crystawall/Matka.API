const express = require('express');
const router = express.Router();
const loginController = require('../controllers/logincontroller');
const usercontroller =  require('../controllers/usercontroller');
const matchcontroller =  require('../controllers/matchcontroller');
const registerController =  require('../controllers/registercontroller');
const marketcontoller =  require('../controllers/marketcontoller');
const dashboardcontroller =   require('../controllers/dashboardcontroller');


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
 router.get('/matches/:id', matchcontroller.getMatchById); 
 router.delete('/deletematch/:id', authMiddleware,matchcontroller.deleteMatch);


  router.post('/getmarket', marketcontoller.getAllMarkets);
  router.post('/getmarkets', marketcontoller.getAdminDashboardMarkets);
  // router.post('/getmarket', marketcontoller.getAllMarkets);
  // router.post('/getmarket', marketcontoller.getAllMarkets);
  // router.post('/getmarket', marketcontoller.getAllMarkets);


  router.post('/totaldata',authMiddleware,dashboardcontroller.getDashboardData);
  router.post("/dashboard/marketwise",authMiddleware, dashboardcontroller.getMarketwiseDashboardData);
  router.post("/dashboard/bettype",authMiddleware, dashboardcontroller.getBetTypeDistribution);
  router.post("/recent/matches", authMiddleware,dashboardcontroller.getRecentMatches);






module.exports = router;
