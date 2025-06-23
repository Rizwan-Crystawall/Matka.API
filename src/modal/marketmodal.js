// models/MarketModel.js
const { execute } = require("../utils/dbHelper");


const 
  getAllMarkets=  async () => {
    const sql = "SELECT * FROM markets ORDER BY id DESC";
    const rows = await execute(sql); 
    return rows;
  };

const getMarket = async () => {
  const _sql = `
    SELECT m.id, m.name, m.is_active as status, m.created_on, m.modified_on
    FROM markets m 
    WHERE is_deleted = 0
  `;
  const rows = await execute(_sql); 
    return rows;
};
const checkMarketExists = async (name) => {
  const sql = `SELECT id FROM markets WHERE name = ? and is_active=1`;
  return await execute(sql, [name]);
};
const addMarket = async (name) => {
  const sql = `INSERT INTO markets (name, is_active, is_deleted, created_on) VALUES (?, 1, 0, NOW())`;
  return await execute(sql, [name]);
};



// ✅ Updates the market
const updateMarket = async (id, name, is_active) => {
  const sql = `
    UPDATE markets 
    SET name = ?, is_active = ? 
    WHERE id = ?
  `;
  const result = await execute(sql, [name, is_active, id]);
  return result;
};
const checkDuplicateMarket = async (name, is_active, market_id) => {
  const sql = `
    SELECT id FROM markets 
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) 
      AND is_active = ? 
      AND id != ?
  `;
  const rows = await execute(sql, [name, is_active, market_id]);
  return rows;
};
const deleteMarket = async (id) => {
  const sql = `
    UPDATE markets
    SET is_deleted = 1, modified_on = NOW()
    WHERE id = ?
  `;
  return await execute(sql, [id]);
};


module.exports = {
  getAllMarkets,
  addMarket,
  getMarket,
  updateMarket,
  deleteMarket,
  checkMarketExists,
  checkDuplicateMarket
}