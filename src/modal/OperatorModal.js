// models/MarketModel.js
const { execute } = require("../utils/dbHelper");

const getOperators = async () => {
  const sql = `
SELECT id, operator_id, api_secret, environment, callback_url, shared_secret, status, created_at
FROM operators WHERE is_deleted = 0
  `;

  const rows = await execute(sql);
  return rows;
};

const addOperator = async ({
  operator_id,
  environment,
  callback_url,
}) => {
  const sql = `
    INSERT INTO operators (operator_id, environment, callback_url, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  const values = [operator_id, environment, callback_url];
  const result = await execute(sql, values);

  return {
    id: result.insertId,
    operator_id,
    environment,
    callback_url,
  };
};
const updateOperator = async ({
  id,
  operator_id,
  environment,
  callback_url,
}) => {
  const sql = `
    UPDATE operators
    SET operator_id = ?, environment = ?, callback_url = ?
    WHERE id = ?
  `;

  const values = [operator_id, environment, callback_url, id];
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
  };
};
const getOperatorById = async (id) => {
  const _sql = `
    SELECT 
  o.id, 
  o.operator_id, 
  o.environment, 
  o.callback_url, 
  o.status
FROM operators o 
WHERE o.id = ? AND o.is_deleted = 0
LIMIT 1;

  `;

  const rows = await execute(_sql, [id]);
  return rows;
};

const deleteOperator = async (id) => {
  const sql = `
    UPDATE operators
    SET is_deleted = 1
    WHERE id = ?
  `;
  return await execute(sql, [id]);
};

// OperatorModal.js
const updateOperatorStatus = async ( status, id ) => {
  console.log(status, id)
  const sql = `
    UPDATE operators
    SET status = ?
    WHERE id = ?
  `;
  const values = [status, id];
  const result = await execute(sql, values);

  if (result.affectedRows === 0) {
    throw new Error(`Operator with id ${id} not found`);
  }

  return { id, status };
};







module.exports = {
  getOperators,
  addOperator,
  updateOperator,
  getOperatorById,
  deleteOperator,
  updateOperatorStatus
};
