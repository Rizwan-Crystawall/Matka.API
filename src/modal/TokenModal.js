const { execute } = require("../utils/dbHelper");

const verifyOperator = async (operator_id, api_secret) => {
  const sql =
    "SELECT * FROM operators where operator_id = ? AND api_secret = ?";
  const rows = await execute(sql, [operator_id, api_secret]);
  return rows || [];
};

const getOperatorDetails = async (operator_id) => {
  const sql = "SELECT * FROM operators where operator_id = ?";
  const rows = await execute(sql, [operator_id]);
  return rows || [];
};
module.exports = {
  verifyOperator,
  getOperatorDetails,
};
