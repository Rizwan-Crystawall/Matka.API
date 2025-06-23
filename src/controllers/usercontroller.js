const UserService = require('../services/userservice');
const parseJwt = require('../utils/parseJwt'); // if not already required



const getAdminDashboardUsers = async (req, res) => {
  
  try {
    const  data = req.body;
    const users = await UserService.fetchAdminDashboardUsers(data );
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const result = await UserService.registerUser(req.body);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Register User Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    const result = await UserService.deleteUserFromAdmin(req.body);
    res.status(200).json({ success: true, message: "User deleted successfully"});
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserController = async (req, res) => {
  try {
    await UserService.updateUserFromAdmin(req.body);
    
    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update user.",
    });
  }
};



module.exports = {
 getAdminDashboardUsers,
 updateUserController,
  deleteUser,
  registerUser
};
