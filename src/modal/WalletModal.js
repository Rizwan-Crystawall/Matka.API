const { execute } = require('../utils/dbHelper');

const getWalletByUserId = async (userId) => {
  const sql = `
    SELECT wallet_balance AS balance, exposure 
    FROM wallet 
    WHERE user_id = ?
  `;
  const rows = await execute (sql, [userId]);
  return rows; 
};

module.exports = {
  getWalletByUserId,
};