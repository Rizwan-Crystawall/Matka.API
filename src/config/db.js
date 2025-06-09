// src/db.js
const mysql = require('mysql2/promise');
const common = require('../utils/common'); // adjust path as needed

const pool = mysql.createPool({
  host: common.MYSQL_HOST,
  user: common.MYSQL_USER,
  password: common.MYSQL_PASSWORD,
  database: common.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
