const { execute } = require('../utils/dbHelper');

const Login = async (email) => {
  console.log(email,"1");
  
  const sql = "SELECT name, email, password, role_id as u_role FROM users WHERE email = ? AND is_active = 1 LIMIT 1";
  return await execute(sql, [email]);
};

module.exports = {
  Login
};