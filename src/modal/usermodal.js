const { execute } = require('../utils/dbHelper');



const getAdminDashboardUsers = async (data) => {
  const _sql = `
    SELECT u.id, u.name, u.email, u.phone_number AS phone, ur.name AS role, u.is_active AS status
    FROM users u
    JOIN user_roles ur ON ur.id = u.role_id
    WHERE u.is_deleted = 0 AND u.id != ?;
  `;

  const rows = await execute(_sql,[data.user_id]);
  return rows;
};


const registerUser = async (email, name, password, phone, role_id, status) => {
   const queryCheck ="SELECT * FROM users WHERE email = ?";
   const existingUsers = await execute(queryCheck, [ email]);
  

  if (existingUsers.length > 0) {
    throw new Error("User with this email already exists.");
  }
  const insertQuery = `
    INSERT INTO users 
      (email, name, password, phone_number, role_id, is_active)
    VALUES 
      (?, ?, ?, ?, ?, ?)
  `;
  return await execute (insertQuery, [
    email,
    name,
    password,     // already hashed by your service
    phone,
    role_id,
    status
  ]);
};






const updateUserFromAdmin = async (data) => {
     const role_id = data.role === "user" ? 2 : 1;
  const { user_id, email, name, phone, status } = data;

  // Check if email already exists for a different user
  const queryCheck = "SELECT * FROM users WHERE id != ? AND email = ?";
  const existingUsers = await execute(queryCheck, [user_id, email]);
  console.log(existingUsers);
  

  if (existingUsers.length > 0) {
    throw new Error("User with this email already exists.");
  }

  // Update the user
  const updateQuery = `
    UPDATE users
    SET email = ?, name = ?, phone_number = ?, role_id = ?, is_active = ?
    WHERE id = ?
  `;
  const result = await execute(updateQuery, [
    email,
    name,
    phone,
    role_id,
    status,
    user_id,
  ]);

  return result; // contains affectedRows, insertId, etc.
};





const deleteUserFromAdmin = async (data) => {
  const userId = data.delete_user_id;
  if (!userId) {
    throw new Error("User ID is required");
  }
  // const _sql_rest_url = "DELETE FROM users WHERE id = ?";
  const _sql_rest_url = "UPDATE users SET is_deleted = 1 WHERE id = ?";
   const rows = await execute(_sql_rest_url, [userId]);
  return rows;
};


module.exports = {
  getAdminDashboardUsers,
  deleteUserFromAdmin,
  updateUserFromAdmin,
  registerUser
  
};
