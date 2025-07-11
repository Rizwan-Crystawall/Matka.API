 const { sign: asyncJWTSign } = require('jsonwebtoken');
// const jwt = require("jsonwebtoken");
// const asyncJWTSign = promisify(jwt.sign, jwt);
const common = require('../utils/common'); // adjust path as needed
const jwt = require('jsonwebtoken');


// console.log(common.SHRI_JWT_SECRET); // will print "sri2022"



const getSignedToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.u_role
    },
    common.SHRI_JWT_SECRET,
    { expiresIn: '8h' }
  );
};

module.exports = { getSignedToken };
