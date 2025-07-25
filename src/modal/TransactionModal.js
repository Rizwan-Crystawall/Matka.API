const { execute } = require("../utils/dbHelper");

const createTransaction = async (data) => {
  const sql = `
   INSERT INTO transactions (user_id, transaction_id, request_id, operator_id, trans_type, rollback_reason, amount)
   VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await execute(sql, [
    data.userId,
    data.transactionId,
    data.requestId,
    data.operatorId,
    data.transType,
    data.reason || null,
    data.debitAmount,
  ]);
  return result.affectedRows;
};

const createWalletSnapshot = async (data, balance) => {
  const sql = `
   INSERT INTO wallet_snapshots (user_id, transaction_id, request_id, request_type, balance)
   VALUES (?, ?, ?, ?, ?)
  `;
  const result = await execute(sql, [
    data.userId,
    data.transactionId,
    data.requestId,
    data.requestType,
    balance,
  ]);
  return result.affectedRows;
};

const updateTransaction = async (data) => {
  const sql = `
   UPDATE transactions SET status = "Deleted", rollback_reason="Can Bet False" WHERE transaction_id = ?
  `;
  const result = await execute(sql, [data.transactionId]);
  return result.changedRows;
};

const getBetRequestUrl = async (operatorId) => {
  const sql = `SELECT CASE
    WHEN RIGHT(callback_url, 1) = '/' THEN CONCAT(callback_url, 'betrequest')
    ELSE CONCAT(callback_url, '/betrequest')
    END AS callback_url FROM operators WHERE id = ?`;
  const result = await execute(sql, [operatorId]);
  return result[0].callback_url;
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  updateTransaction,
  getBetRequestUrl,
};
