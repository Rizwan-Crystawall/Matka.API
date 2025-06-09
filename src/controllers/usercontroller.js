const UserService = require('../services/userservice');

const getUsers = async (req, res, next) => {
  try {
    
    const email = parseJwt(req).email;  
    const users = await UserService.getUsersByEmail(email);
    
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error); 
  }
};

module.exports = {
  getUsers,
};
