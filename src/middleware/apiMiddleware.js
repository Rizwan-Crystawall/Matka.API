const jwt = require("jsonwebtoken");
function decodeToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  // console.log("Token"); 
  // console.log(token);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request. Token not provided.",
    });
  }
  try {
    const decoded = jwt.decode(token, { complete: true });
    // console.log(decoded);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    req.user = decoded.payload;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Invalid Token",
    });
  }
}
module.exports = decodeToken;