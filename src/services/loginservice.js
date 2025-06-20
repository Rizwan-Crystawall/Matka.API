const Login = require('../modal/loginmodal');
const { getSignedToken } = require('../utils/jwt');
const { InputError, AuthError } = require('../utils/errors');
const argon2 = require('argon2');



const loginService = async (email, password) => {

 if (!email) {
  throw new InputError("Email is required");
}
  if (!password) throw new InputError("Password is required");

  const user = await Login.Login(email);
 if (!user || user.length === 0) {
    throw new AuthError("Wrong Username Or Password");
  }
  const isPasswordCorrect = await argon2.verify(user[0].password, password);
  if (!isPasswordCorrect) {
    throw new AuthError("Wrong Username Or Password");
  }

  const token = await getSignedToken(user);

  return {
    success: true,
    role: user[0].u_role,
    name: user[0].name,
    token,
    email: user[0].email,
    uid: user[0].uid
  };
};

module.exports = loginService;
