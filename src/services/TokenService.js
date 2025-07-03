const TokenModal = require("../modal/TokenModal");
const { generateSignature } = require("./../utils/security");
const jwt = require("jsonwebtoken");

const authToken = async (data) => {
  try {
    if(!data.body.operator_id||!data.body.user_id)
      return { success: false, message: "Operator ID / User ID missing" };  
    const result = await TokenModal.verifyOperator(data.body.operator_id);
    if (result.length>0) {
        if(!data.headers[result[0].api_key])
            return { success: false, message: "API key Not Found" };
        if(result[0].api_secret!==data.headers[result[0].api_key])
            return { success: false, message: "Incorrect API secret" };
       const secret = result[0].shared_secret;
       const userId = data.body.user_id;
       const payload = {
        userId,
        signature: generateSignature(userId, secret),
        iat: Math.floor(Date.now() / 1000),
        // eat: expiry,
      };
      const token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: "1h",
      });
      return { success: true, message: "Token Generated Successfully", token: token };
    } else {
      return { success: false, message: "Operator Not Found" };
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return { success: false, message: "Internal server error" };
  }
}

module.exports = {
  authToken,
};