const { execute } = require('../utils/dbHelper');


const getBetsByMatchAndUser = async (matchId, userId) => {
  const sql = `
    SELECT 
      bd.digit, 
      b.stake, 
      b.rate, 
      mtm.type_id as type, 
      CASE 
        WHEN mtm.type_id = 1 THEN 'single' 
        WHEN mtm.type_id = 2 THEN 'singlePatti' 
        WHEN mtm.type_id = 3 THEN 'doublePatti' 
        WHEN mtm.type_id = 4 THEN 'tripplePatti' 
        WHEN mtm.type_id = 5 THEN 'jodi' 
        ELSE 'unknown' 
      END AS type_name, 
      CASE 
        WHEN b.is_closed_type = 0 THEN 'open' 
        WHEN b.is_closed_type = 1 THEN 'close' 
        ELSE 'unknown' 
      END AS time 
    FROM bets b 
    JOIN bet_digits bd ON b.id = bd.bet_id 
    JOIN matches_type_mapping mtm ON b.match_map_id = mtm.id 
    WHERE mtm.match_id = ? AND b.user_id = ? AND b.status_id = 1
  `;
  const rows = await execute(sql, [matchId, userId]);
  return rows;
};

const getUserBetsByMatch = async (user_id, match_id) => {
  const sql = `
    SELECT 
      m.name,
      mtm.type_id AS match_map_id,
      b.is_closed_type,
      bd.digit,
      b.stake,
      b.rate,
      b.created_on
    FROM 
      bets b
      JOIN bet_digits bd ON b.id = bd.bet_id
      JOIN matches_type_mapping mtm ON b.match_map_id = mtm.id
      JOIN matches m ON mtm.match_id = m.id
    WHERE 
      b.user_id = ?
      AND mtm.match_id = ?
      AND b.status_id = 1
  `;

  const rows = await execute(sql, [user_id, match_id]);
  return rows;
};

module.exports = {
  getBetsByMatchAndUser,
  getUserBetsByMatch
};