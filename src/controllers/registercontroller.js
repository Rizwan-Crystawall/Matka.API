const utils = require('../utils/success');
const registerService = require("../services/registerservice");


exports.register = async (req, res) => {
  try {    
    const { name,email, password,confirm_password,phone,role_id,is_active } = req.body;

    const result = await registerService.register({  name,email, password,confirm_password,phone,role_id,is_active });

    utils.successResponse(res, {
      message: "User registered successfully",
      ...result
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

