const { execute } = require("../utils/dbHelper");


const getDashboardStats = async () => {
  const _sql = `
    SELECT
      (SELECT COUNT(*) FROM users WHERE is_deleted = 0) AS activeUsers,
      (SELECT COUNT(*) FROM markets WHERE is_deleted = 0) AS totalMarkets,
      (SELECT COUNT(*) FROM matches WHERE is_deleted = 0) AS totalMatches
  `;
  const rows = await execute(_sql);
  return rows[0]; 
};


const getDashboardDataMarketwise = async () => {
  const _sql = `
    SELECT mkt.name AS name, COUNT(m.id) AS stat
    FROM matches m
    JOIN markets mkt ON mkt.id = m.market_id
    WHERE m.is_active = 1
    GROUP BY m.market_id
  `;
  const rows = await execute (_sql);
  return rows;
};

const getBetTypeDistribution = async () => {
  const _sql = `
    SELECT mt.name, COUNT(*) AS stat
    FROM bets b
    JOIN matches_type_mapping mtm ON b.match_map_id = mtm.id
    JOIN match_types mt ON mt.id = mtm.type_id
    WHERE b.status_id = 1
    GROUP BY mtm.type_id
  `;
  const rows = await execute(_sql);
  return rows;
};


const getRecentMatches = async (data) => {
  const _sql = `
    SELECT m.id, m.name, m.draw_date, m.open_time, m.close_time, m.is_active, m.open_suspend, m.close_suspend
    FROM matches m
    WHERE m.is_active = 1
    ORDER BY m.id DESC
    LIMIT 3
  `;
 
   const rows = await execute(_sql);
  return rows;
};


module.exports = { getDashboardStats,getDashboardDataMarketwise,getBetTypeDistribution,getRecentMatches };

 