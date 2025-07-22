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
    SELECT m.id, m.name, m.is_active as status, m.is_deleted as deleted,m.created_on, m.modified_on
    FROM markets m 
    WHERE is_deleted = 0
  `;
  const rows = await execute(_sql); 
    return rows;
};
const checkMarketExists = async (name) => {
  const sql = `SELECT id FROM markets WHERE name = ? and is_active=1 AND is_deleted=0`;
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

const fetchActiveMatchMappings = async () => {
  const sql = `
    SELECT 
      m.market_id, 
      mkt.name AS market_name, 
      m.id AS match_name_id, 
      m.name AS match_name, 
      mtm.type_id, 
      mtm.rate, 
      m.draw_date, 
      m.open_time, 
      m.close_time, 
      m.is_active, 
      m.open_suspend, 
      m.close_suspend,
      res.open_result,
      res.close_result,
      mtm.id
    FROM matches m
    JOIN matches_type_mapping mtm ON mtm.match_id = m.id
    JOIN markets mkt ON m.market_id = mkt.id
    LEFT JOIN results res ON res.match_map_id = mtm.id
    WHERE 
      mkt.is_active = 1 AND 
      m.is_active = 1 AND 
      m.is_deleted = 0
      AND DATE(m.draw_date) = CURDATE();
  `;

  return await execute(sql);
};

module.exports = {
  getAllMarkets,
  addMarket,
  getMarket,
  updateMarket,
  deleteMarket,
  checkMarketExists,
  checkDuplicateMarket,
  fetchActiveMatchMappings
}