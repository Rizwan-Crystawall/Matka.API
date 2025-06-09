const express = require('express');
const router = express.Router();
const loginController = require('../controllers/logincontroller');
const usercontroller =  require('../controllers/usercontroller');
const registerController =  require('../controllers/registercontroller');

router.post('/user/login', loginController.login);
router.post("/register", registerController.register);
router.post('/getusers', usercontroller.getUsers);



module.exports = router;
