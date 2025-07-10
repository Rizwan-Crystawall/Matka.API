const { execute } = require("../utils/dbHelper");

const createTransaction = async (data) => {
  const sql = `
   INSERT INTO transactions (user_id, transaction_id, request_id, operator_id, trans_type, amount)
   VALUES (?, ?, ?, ?, ?,?)
  `;
  const result = await execute(sql, [
    data.user_id,
    data.transaction_id,
    data.request_id,
    data.operator_id,
    data.trans_type,
    data.amount,
  ]);
  return result.affectedRows;
};

const createWalletSnapshot = async (data) => {
  const sql = `
   INSERT INTO wallet_snapshots (user_id, transaction_id, request_id, request_type, balance)
   VALUES (?, ?, ?, ?, ?)
  `;
  const result = await execute(sql, [
    data.user_id,
    data.transaction_id,
    data.request_id,
    data.request_type,
    data.balance,
  ]);
  return result.affectedRows;
};

const deleteTransaction = async (data) => {
  const sql = `
   DELETE FROM transactions WHERE transaction_id = ?
  `;
  const result = await execute(sql, [data.transaction_id]);
  return result.affectedRows;
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  deleteTransaction,
};
