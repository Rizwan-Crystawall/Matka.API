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

module.exports = {
  createTransaction,
  createWalletSnapshot,
  updateTransaction,
};
