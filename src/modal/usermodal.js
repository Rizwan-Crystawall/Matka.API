const { execute } = require('../utils/dbHelper');

const getAllUsers = async () => {
  const sql = 'SELECT id, name, email, role_id FROM users';
  const rows = await execute(sql);
  return rows;
};

const insertUser = async ({name, phone_number,email, role_id, is_active }) => {
  const sql = `INSERT INTO users (name, phone_number,email, role_id, is_active) VALUES (?, ?, ?, ?, ?)`;
  const result = await execute(sql, [name, phone_number,email, role_id, is_active]);
  
  if (result.insertId) {
    return { id: result.insertId, name, phone_number,email, role_id, is_active };
  }

  return null;
};

const updateUser = async (id, userData) => {  
  const sql = `
    UPDATE users 
    SET name = ?, phone_number = ?, email = ?, role_id = ?, is_active = ? 
    WHERE id = ?
  `;

  const params = [
    userData.name,
    userData.phone_number,
    userData.email,
    userData.role_id,
    userData.is_active,
    id,
  ];

  const result = await execute(sql, params);
  if (result.affectedRows > 0) {
    return { id, ...userData };
  }
  return null;
};
const deleteUser = async (id) => {
  const sql = `DELETE FROM users WHERE id = ?`;
  const result = await execute(sql, [id]);

  return result.affectedRows > 0;
};


module.exports = {
  getAllUsers,
  insertUser,
  updateUser,
  deleteUser
  
};
