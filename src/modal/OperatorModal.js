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

const addOperator = async ({ operator_id, environment, callback_url }) => {
  const sql = `
    INSERT INTO operators (operator_id, environment, callback_url, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  const values = [operator_id, environment, callback_url];
  const result = await execute(sql, values);

  return {
    status: 201,
    success: true,
    id: result.insertId,
    operator_id,
    environment,
    callback_url,
  };
};
const findByOperatorId = async (operator_id) => {
  const sql = `SELECT * FROM operators WHERE operator_id = ?`;
  return await execute(sql, [operator_id]);
};

const updateOperator = async ({ id, operator_id, environment, callback_url }) => {
  // Check if operator_id exists for another record
  const checkSql = `SELECT id FROM operators WHERE operator_id = ? AND id != ?`;
  const existing = await execute(checkSql, [operator_id, id]);

  if (existing.length > 0) {
    return {
      success: false,
      message: "Operator ID already exists.",
      status: 400,
    };
  }

  const updateSql = `
    UPDATE operators
    SET operator_id = ?, environment = ?, callback_url = ?
    WHERE id = ?
  `;

  const result = await execute(updateSql, [
    operator_id,
    environment,
    callback_url,
    id,
  ]);

  if (result.affectedRows === 0) {
    const error = new Error(`Operator with id ${id} not found`);
    error.status = 404;
    throw error;
  }

  return {
    success: true,
    message: "Operator updated successfully",
    data: {
      id,
      operator_id,
      environment,
      callback_url,
    },
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
const updateOperatorStatus = async (status, id) => {
  const sql = `
    UPDATE operators
    SET status = ?
    WHERE id = ?
  `;
  const values = [status, id];
  const result = await execute(sql, values);
  return { result };
};

const getStatusByOperatorId = async (operatorId) => {
  const sql = `
  SELECT
  b.user_id AS total_users ,
  COUNT(DISTINCT b.id) AS total_bets,
  COUNT(bd.digit) AS total_digits,
  SUM(bd.stake)  AS total_amount
  FROM bets b
  JOIN bet_digits bd ON bd.bet_id = b.id
  WHERE b.operator_id = ?
  GROUP BY b.user_id;
  `;
  const values = [operatorId];
  const result = await execute(sql, values);
  return { result };
};
const getOperatorsList = async () => {
  const sql = `SELECT id, operator_id FROM operators ORDER BY id ASC`;
  const rows = await execute(sql);
  return rows;
};

module.exports = {
  getOperators,
  addOperator,
  updateOperator,
  getOperatorById,
  deleteOperator,
  updateOperatorStatus,
  findByOperatorId,
  getStatusByOperatorId,
  getOperatorsList,
};
