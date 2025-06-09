const UserService = require('../services/userservice');
const parseJwt = require('../utils/parseJwt'); // if not already required
const { login } = require('./logincontroller');

const getAllUsers = async (req, res, next) => {
  try {
    const email = parseJwt(req).email;
    
    const users = await UserService.getAllUsers(email);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
const addUser = async (req, res) => {
  try {
    const { name, phone_number,email, role_id, is_active } = req.body;

    // You can add input validation here

    const result = await UserService.createUser({ name, phone_number,email, role_id, is_active });

    if (!result) {
      return res.status(400).json({ success: false, message: 'Failed to create user' });
    }

    res.status(201).json({ success: true, message: 'User added successfully', user: result });
  } catch (error) {
    console.error('Add User Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const editUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone_number, email, role_id, is_active } = req.body;

    const updatedUser = await UserService.updateUser(userId, {
      name,
      phone_number,
      email,
      role_id,
      is_active,
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found or update failed' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Edit User Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserService.deleteUser(id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found or already deleted' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



module.exports = {
  getAllUsers,
  addUser,
  editUser,
  deleteUser
};
