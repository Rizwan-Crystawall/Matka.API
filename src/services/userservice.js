const User = require('../modal/usermodal');
const argon2 = require('argon2');


const fetchAdminDashboardUsers = async (data) => {
  return await User.getAdminDashboardUsers(data);
};

const deleteUserFromAdmin = async (data) => {
  try {
    const result = await User.deleteUserFromAdmin(data);
    return result; 
  } catch (error) {
    console.error("Delete User Error:", error);
    throw new Error("Failed to delete user"); 
  }
};


const registerUser = async (data) => {
  
  const { username, name, phone, role, status, password, wallet_balance} = data;

  if ( !username || !name || !phone || !password || status === undefined) {
    return {
      success: false,
      message: "All fields are requiredf.",
    };
  }

  const role_id = role === "user" ? 2 : 1;

  try {
    const existing = await User.findUserByEmail(username);
    if (existing.length > 0) {
      return {
        success: false,
        message: "User with this username already exists.",
      };
    }

    const hashedPassword = await argon2.hash(password);

    const result = await User.registerUser(
      username,
      name,
      hashedPassword,
      phone,
      role_id,
      status,
      wallet_balance
    );

    return {
      success: true,
      message: "User registered successfully.",
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Registration failed.",
    };
  }
};





const updateUserFromAdmin = async (data) => {
  const { user_id, username, name, phone, role, status } = data;

  if (!user_id || !username || !name || !phone || !role || status === undefined) {
    throw new Error("All fields are required.");
  }

  // username format validation
  // const usernameRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if (!usernameRegex.test(username)) {
  //   throw new Error("Invalid username format.");
  // }

  // Check for duplicate username
  const existing = await User.checkEmailUser(user_id, username);
  if (existing.length > 0) {
    throw new Error("User with this username already exists.");
  }

  // Convert role
  const role_id = role === "user" ? 2 : 1;

  // Proceed to update
  const result = await User.updateUserFromAdmin({
    user_id,
    username,
    name,
    phone,
    role_id,
    status,
  });

  if (result.affectedRows === 0) {
    throw new Error("No user found with the given ID.");
  }

  return true;
};







module.exports = {
  fetchAdminDashboardUsers,
  updateUserFromAdmin,
  deleteUserFromAdmin,
  registerUser
};
