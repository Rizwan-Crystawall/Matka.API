const { execute } = require('../utils/dbHelper');

const Login = async (email) => {
  const sql = "SELECT name, email, password, role_id as u_role FROM users WHERE email = ? AND is_active = 1 LIMIT 1";
  return await execute(sql, [email]);
};

module.exports = {
  Login
};

const getProfile = async (email) => {
  const sql = 'SELECT id, parent_id, role_id as u_role FROM users WHERE email = ? AND is_active = 1 LIMIT 1';
  const [rows] = await pool.query(sql, [email]);
  return rows;
};

const getUsers = async (s_id) => {
  const sql = 'SELECT id, name, email, role_id FROM users WHERE parent_id = ? AND is_active = 1';
  const [rows] = await pool.query(sql, [s_id]);
  return rows;
};

module.exports = {
  getProfile,
  getUsers,
};

