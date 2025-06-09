const jwt = require('jsonwebtoken');
const common = require('../utils/common'); // adjust path if needed

const parseJwt = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, common.SHRI_JWT_SECRET);
    return payload;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

module.exports = parseJwt;
