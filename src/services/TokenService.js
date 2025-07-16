const TokenModal = require("../modal/TokenModal");
const { generateSignature } = require("./../utils/security");
const jwt = require("jsonwebtoken");

const authToken = async (req) => {
  try {
    const apiSecret = req.headers["api-key"];
    if (!req.body.operatorId || !req.body.userId || !apiSecret)
      return { success: false, message: "Invalid Parameters" };
    const result = await TokenModal.verifyOperator(
      req.body.operatorId,
      apiSecret
    );
    if (result.length > 0) {
      const secret = result[0].shared_secret;
      const operatorId = result[0].id;
      const userId = req.body.userId;
      const payload = {
        operatorId,
        userId,
        signature: generateSignature(userId, secret),
        iat: Math.floor(Date.now() / 1000),
      };
      const token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: "1h",
      });
      return {
        success: true,
        message: "Token Generated Successfully",
        token: token,
        id: operatorId,
      };
    } else {
      return { success: false, message: "Operator Not Found" };
    }
  } catch (error) {
    return { success: false, message: "Internal server error" };
  }
};

const verifyAuth = async (req) => {
  try {
    const operatorId = req.user.operatorId;
    const userId = req.user.userId;
    const signature_from_token = req.user.signature;
    const result = await TokenModal.getOperatorDetails(operatorId);
    if (result.length > 0) {
      const secret = result[0].shared_secret;
      const signature = generateSignature(userId, secret);
      if (signature_from_token === signature) {
        return {success: true};
      } else {
        return { success: false, message: "Invalid Signature" };
      }
    } else {
      return { success: false, message: "Operator details Not Found" };
    }
  } catch (error) {
    return { success: false, message: "Internal server error" };
  }
};

module.exports = {
  authToken,
  verifyAuth,
};
