const loginService = require('../services/loginservice');
const jwt = require('jsonwebtoken');
const common = require('../utils/common'); 
const utils = require('../utils/success');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip; 
    const result = await loginService(email, password, ip);

    utils.successResponse(res, {
      message: 'Login successful',
      token: result.token,
      role: result.role,
      name: result.name,
      uid: result.uid,
      email: result.email,
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
