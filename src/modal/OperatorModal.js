// models/MarketModel.js
const { execute } = require("../utils/dbHelper");


const  getOperators = async () => {
  const sql = `
    SELECT id, operator_id, api_secret, environment, callback_url, shared_secret, status, created_at
    FROM operators
    WHERE status = 1
  `;

  const rows = await execute(sql);
  return rows;
};

const addOperator = async ({ operator_id, environment, callback_url, status }) => {
  const sql = `
    INSERT INTO operators (operator_id, environment, callback_url, status, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  const values = [operator_id, environment, callback_url, status];
  const result = await execute(sql, values);

  return {
    id: result.insertId,
    operator_id,
    environment,
    callback_url,
    status
  };
};
const updateOperator = async ({ id, operator_id, environment, callback_url, status }) => {
  const sql = `
    UPDATE operators
    SET operator_id = ?, environment = ?, callback_url = ?, status = ?
    WHERE id = ?
  `;

  const values = [operator_id, environment, callback_url, status, id];
  const result = await execute(sql, values);

  if (result.affectedRows === 0) {
    const error = new Error(`Operator with id ${id} not found`);
    error.status = 404;
    throw error;
  }

  return {
    id,
    operator_id,
    environment,
    callback_url,
    status,
  };
};




module.exports = {
  getOperators,
  addOperator,
  updateOperator
};
