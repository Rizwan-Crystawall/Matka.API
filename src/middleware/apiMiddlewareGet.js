const TokenModal = require("../modal/TokenModal");
const { generateSignature } = require("./../utils/security");
const jwt = require("jsonwebtoken");
async function decodeToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request. Token not provided.",
    });
  }
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    req.user = decoded.payload;
    const operatorId = req.params.operatorId;
    const userId = req.params.userId;
    const signature_from_token = req.user.signature;
    const result = await TokenModal.getOperatorDetails(operatorId);
    // console.log(result);
    if (result.length > 0) {
      const secret = result[0].shared_secret;
      const signature = generateSignature(userId, secret);
      if (signature_from_token === signature) {
        // return { success: true };
        next();
      } else {
        // return { success: false, message: "Invalid Signature" };
        return res.status(500).json({
          success: false,
          message: "Invalid Signature",
        });
      }
    } else {
      // return { success: false, message: "Operator details Not Found" };
      return res.status(500).json({
        success: false,
        message: "Operator details Not Found",
      });
    }
    // next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Invalid Token",
    });
  }
}
module.exports = decodeToken;
