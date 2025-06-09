const argon2 = require("argon2");
const { InputError, AuthError } = require("../utils/errors");
const User = require("../modal/registermodal"); // or DB query file
const { getSignedToken } = require("../utils/jwt");

exports.register = async ({
  name,
  role_id,
  password,
  confirm_password,
  email,
  phone_number,
  is_active,
}) => {
  if (!email) throw new InputError("Email is required");
  if (!password) throw new InputError("Password is requiredsss");
  if (!name) throw new InputError("Name is required");

  const existingUser = await User.findByEmail(email); // your DB query
  if (existingUser) throw new AuthError("Email already registered");

  const hashedPassword = await argon2.hash(password);

  const newUser = await User.create({
    name,
    role_id: 2,
    password: hashedPassword,
    email,
    phone_number,
    is_active:1,
  });

  const token = await getSignedToken(newUser);

  return {
    token,
    role: newUser.u_role,
    name: newUser.name,
  };
};
