// models/MarketModel.js
const { execute } = require("../utils/dbHelper");


const 
  getAllMarkets=  async () => {
    const sql = "SELECT * FROM markets ORDER BY id DESC";
    const rows = await execute(sql); 
    return rows;
  };

const getAdminDashboardMarkets = async () => {
  const _sql = `
    SELECT m.id, m.name, m.is_active as status, m.created_on, m.modified_on
    FROM markets m 
    WHERE is_deleted = 0
  `;
  const rows = await execute(_sql); 
    return rows;
};

module.exports = {
  getAllMarkets,
  getAdminDashboardMarkets
}