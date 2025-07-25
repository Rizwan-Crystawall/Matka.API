const loginService = require('../services/LoginService');
const jwt = require('jsonwebtoken');
const common = require('../utils/common'); 
const utils = require('../utils/success');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip; 
    const result = await loginService(username, password, ip);

    utils.successResponse(res, {
      message: 'Login successful',
      token: result.token,
      role: result.role,
      name: result.name,
      uid: result.uid,
      username: result.username,
      balance: result.wbal,
      exposure: result.wexp
    });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Internal Server Error'
    });
  }
};
