// helpers/dbHelper.js
// const pool = require('../config/db');

// const execute = async (sql, params = []) => {
//   try {
//     const [rows] = await pool.query(sql, params);
//     return rows;
//   } catch (error) {
//     console.error('DB Query Error:', error);
//     throw error;
//   }
// };

// module.exports = {
//   execute
// };
// utils/dbHelper.js

const pool = require('../config/db');
 
// Normal query (no transaction)

const execute = async (sql, params = []) => {

  const [rows] = await pool.execute(sql, params);

  return rows;

};
 
// Transaction helpers

const beginTransaction = async () => {

  const connection = await pool.getConnection();

  await connection.beginTransaction();

  return connection;

};
 
const commit = async (connection) => {

  await connection.commit();

  connection.release();

};
 
const rollback = async (connection) => {

  await connection.rollback();

  connection.release();

};
 
module.exports = {

  execute,

  beginTransaction,

  commit,

  rollback,

};

 