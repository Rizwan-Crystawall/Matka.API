const { execute } = require('../utils/dbHelper');



const getAdminDashboardUsers = async (data) => {
  const _sql = `
   SELECT u.id,u.name,u.username,u.password,u.email,w.wallet_balance,u.phone_number as phone,ur.name as role,u.is_active as status FROM users u, user_roles ur,wallet w WHERE ur.id=u.role_id and is_deleted=0 and u.id = w.user_id and u.id != ? ORDER BY u.id DESC;
  `;

  const rows = await execute(_sql,[data.user_id]);
  return rows;
};

const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = ?";
  return await execute(query, [email]);
};

const registerUser = async (email, name, password, phone, role_id, status, wallet_balance) => {  
  const insertUserQuery = `
    INSERT INTO users 
      (email, name, password, phone_number, role_id, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const userResult = await execute(insertUserQuery, [
    email,
    name,
    password,
    phone,
    role_id,
    status,
  ]);

  const user_id = userResult.insertId;

  const insertWalletQuery = "INSERT INTO wallet (user_id, wallet_balance) VALUES (?, ?)";
  const result_ = await execute(insertWalletQuery, [user_id, wallet_balance]);

  return {
    user_id,
    email,
    name,
    phone,
    role_id,
    status,
    wallet_balance,
  };
};






const updateUserFromAdmin = async ({ user_id, email, name, phone, role_id, status }) => {
  const updateQuery = `
    UPDATE users
    SET email = ?, name = ?, phone_number = ?, role_id = ?, is_active = ?
    WHERE id = ?
  `;
  return await execute(updateQuery, [
    email,
    name,
    phone,
    role_id,
    status,
    user_id,
  ]);
};
const checkEmailUser = async (user_id, email) => {
  const query = "SELECT * FROM users WHERE id != ? AND email = ?";
  return await execute(query, [user_id, email]);
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
  registerUser,
  findUserByEmail,
  checkEmailUser,

  
};
