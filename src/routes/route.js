const express = require('express');
const router = express.Router();
const loginController = require('../controllers/logincontroller');
const usercontroller =  require('../controllers/usercontroller');
const registerController =  require('../controllers/registercontroller');
const authMiddleware = require('../middleware/middleware');

router.post('/user/login', loginController.login);
router.post("/register", registerController.register);
router.get('/getusers',  authMiddleware,usercontroller.getAllUsers);
router.post('/adduser', usercontroller.addUser); 
router.put('/edituser/:id', usercontroller.editUser);
router.delete('/deleteuser/:id', usercontroller.deleteUser);


module.exports = router;
