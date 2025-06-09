const User = require('../modal/usermodal');

const getUsersByEmail = async (email) => {
  const profile = await User.getProfile(email);

  if (!profile || profile.length === 0) {
    throw new Error('User profile not found');
  }

  const user = profile[0];
  const s_id = user.u_role === 6 ? user.parent_id : user.id;

  const users = await User.getUsers(s_id);
  return users;
};

module.exports = {
  getUsersByEmail,
};
