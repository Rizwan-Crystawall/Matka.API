const { execute } = require('../utils/dbHelper');

const findByEmail = async (email) => {
  const sql = "SELECT id FROM users WHERE email = ?";
  const result = await execute(sql, [email]);
  return result.length > 0 ? result[0] : null;
};

const create = async ({ name, role_id, password, email, phone_number, is_active}) => {
  const sql = `
   INSERT INTO users (name, role_id, password, email, phone_number, is_active)
   VALUES (?, ?, ?, ?, ?,?)
  `;
  const result = await execute(sql, [name, role_id, password, email, phone_number, is_active]);

  return {
    id: result.insertId,
    email,
    name,
    phone_number,
    u_role: role_id,
    is_active
  };
};

module.exports = {
  findByEmail,
  create
};