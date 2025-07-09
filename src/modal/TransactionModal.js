const { execute } = require("../utils/dbHelper");

const createTransaction = async (data) => {

    // console.log("Transaction Modal 1");
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
// console.log("Create TXN");
//   console.log(result[0].affectedRows);
  return result.affectedRows;
}

const createWalletSnapshot = async (data) => {
  //   const sql =
  //     "SELECT * FROM operators where id = ? AND api_secret = ?";
  //   const rows = await execute(sql, [operator_id, api_secret]);
  //   return rows || [];
  // };
// console.log("Modal");
// console.log(data);
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
//   console.log("result Wallet Snapshot");
//   console.log(result);
  return result.affectedRows;
}

module.exports = {
  createTransaction,
  createWalletSnapshot,
};
