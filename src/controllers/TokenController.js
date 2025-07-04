const TokenService = require("../services/TokenService");

const authToken = async (req, res) => {
  try {
    const result = await TokenService.authToken(req);
    if (result.success) {
      return res.status(200).json({token: result.token});
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

const verifyAuth = async (req, res) => {
  try{
    const result = await TokenService.verifyAuth(req);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    } 
  } catch (error){
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  authToken,
  verifyAuth,
};