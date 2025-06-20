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
  const { email, name, phone, role, status } = data;
  let password = data.password ? data.password : "123456";
  
  if (!email || !name || !phone || !password || status === undefined) {
    return {
      success: false,
      message: "All fields are required.",
    };
  }

  const role_id = role === "user" ? 2 : 1;

  try {
    // Hash & overwrite the password variable
    password = await argon2.hash(password);

    // Call the modal/DB layer
    const result = await User.registerUser(
      email,
      name,
      password,   // hashed
      phone,
      role_id,
      status
    );

    return {
      success: true,
      message: "User registered successfully.",
      data: result,
    };
  } catch (err) {
    console.error("Registration error:", err);
    return {
      success: false,
      message: "Something went wrong during registration.",
      error: err.message,
    };
  }
};



const updateUserFromAdmin = async (data) => {
  const { user_id, email, name, phone, role, status } = data;

  if (
    !user_id ||
    !email ||
    !name ||
    !phone ||
    !role ||
    status === undefined
  ) {
    throw new Error("All fields are required.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  const result = await User.updateUserFromAdmin(data);

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
