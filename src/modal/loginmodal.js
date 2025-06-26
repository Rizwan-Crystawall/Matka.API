const { execute } = require('../utils/dbHelper');

const Login = async (username) => {
  
  const sql = "SELECT u.id as uid,u.name,u.username,u.password,u.role_id as u_role,w.wallet_balance as wbal,w.exposure as wexp FROM users u, wallet w WHERE username = ? AND u.id=w.user_id AND u.is_active=1 LIMIT 1";
  return await execute(sql, [username]);
};

module.exports = {
  Login
};