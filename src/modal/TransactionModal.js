const { execute } = require("../utils/dbHelper");

const createTransaction = async (data) => {
  const sql = `
   INSERT INTO transactions (user_id, transaction_id, request_id, operator_id, trans_type, amount)
   VALUES (?, ?, ?, ?, ?,?)
  `;
  const result = await execute(sql, [
    data.userId,
    data.transactionId,
    data.requestId,
    data.operatorId,
    data.transType,
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
  // console.log(result);
  return result.changedRows;
};

const getBetRequestUrl = async (operatorId) => {
  const sql = `SELECT CASE
    WHEN RIGHT(callback_url, 1) = '/' THEN CONCAT(callback_url, 'placebet')
    ELSE CONCAT(callback_url, '/placebet')
    END AS callback_url FROM operators WHERE id = ?`;
  const result = await execute(sql, [operatorId]);
  if (result.length > 0) {
    return result[0].callback_url;
  } else {
    throw new Error("Operator not found");
  }
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  updateTransaction,
  getBetRequestUrl,
};
