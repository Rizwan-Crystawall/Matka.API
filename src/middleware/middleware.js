const jwt = require("jsonwebtoken");
const common = require("../utils/common");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request. Token not provided.",
    });
  }

  jwt.verify(token, common.SHRI_JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verify Error:", err);

      return res.status(403).json({
        success: false,
        message: 'Authentication failed. Invalid token.',
      });
    }

    // Token is valid
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
