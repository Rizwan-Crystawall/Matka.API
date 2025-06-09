// helpers/dbHelper.js
const pool = require('../config/db');

const execute = async (sql, params = []) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('DB Query Error:', error);
    throw error;
  }
};

module.exports = {
  execute
};
