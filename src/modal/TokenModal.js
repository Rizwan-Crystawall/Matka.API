const { execute } = require("../utils/dbHelper");

const verifyOperator = async (operatorId, apiSecret) => {
  const sql =
    "SELECT * FROM operators where id = ? AND api_secret = ?";
  const rows = await execute(sql, [operatorId, apiSecret]);
  return rows || [];
};

const getOperatorDetails = async (operator_id) => {
  const sql = "SELECT * FROM operators where id = ?";
  const rows = await execute(sql, [operator_id]);
  return rows || [];
};
module.exports = {
  verifyOperator,
  getOperatorDetails,
};
