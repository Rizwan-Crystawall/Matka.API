const User = require('../modal/usermodal');

const getAllUsers = async (email) => {
  const profile = await User.getAllUsers(email);

  if (!profile || profile.length === 0) {
    throw new Error('User profile not found');
  }

  const user = profile[0];
  const s_id = user.u_role === 6 ? user.parent_id : user.id;

  const users = await User.getAllUsers(s_id);
  return users;
};
const createUser = async ({ name, phone_number,email, role_id, is_active }) => {
  // Hash the password
  return await User.insertUser({
    name,
    phone_number,
    email,
    role_id,
    is_active: 1
  });
};
const updateUser = async (id, userData) => {  
  return await User.updateUser(id, userData);
};
const deleteUser = async (id) => {
  return await User.deleteUser(id);
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
