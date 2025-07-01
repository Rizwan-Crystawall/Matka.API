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
const getMatchMap = async (match_id, type_id) => {
  const sql = "SELECT id FROM matches_type_mapping WHERE match_id = ? AND type_id = ?";
  const result = await execute(sql, [match_id, type_id]);
  return result[0] || null;
};

const insertBet = async (data) => {
  const betSql = `
    INSERT INTO bets (user_id, match_map_id, stake, rate, status_id, ip, is_closed_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const betResult = await execute(betSql, [
    data.user_id,
    data.match_map_id,
    data.stake,
    data.rate,
    data.status_id,
    data.ip,
    data.is_closed_type || 0,
  ]);

  return betResult.insertId;
};

const insertBetDigits = async (digitData) => {
  const formatted = digitData.map(d => [d.digit, d.bet_id, d.potential_profit]);

  const placeholders = formatted.map(() => `(?, ?, ?)`).join(", ");
  const flatValues = formatted.flat();

  const sql = `
    INSERT INTO bet_digits (digit, bet_id, potential_profit)
    VALUES ${placeholders}
  `;

  const result = await execute(sql, flatValues);
  return result.insertId;
};

const getExistingDigits = async ({ is_closed_type, match_map_id, user_id }) => {
  const sql = `
    SELECT bd.id, bd.digit, bd.potential_profit
    FROM bet_digits bd
    JOIN bets b ON b.id = bd.bet_id
    WHERE b.is_closed_type = ? AND b.match_map_id = ? AND b.user_id = ?`;
  return await execute(sql, [is_closed_type, match_map_id, user_id]);
};

const updateDigitProfit = async (id, profit) => {
  const sql = "UPDATE bet_digits SET potential_profit = ? WHERE id = ?";
  await execute(sql, [profit, id]);
};

const updateWallet = async (user_id, amount) => {
  const sql = `
    UPDATE wallet
    SET exposure = exposure + ?, wallet_balance = wallet_balance - ?
    WHERE user_id = ?`;
  await execute(sql, [amount, amount, user_id]);
};

const getBetsByOperatorId = async () => {
  const sql = `
    SELECT 
  b.id AS bet_id,
  b.match_map_id,
  u.name AS user_id,
  b.stake,
  b.rate,
  b.status_id,
  b.is_closed_type,
  b.created_on,
  b.operator_id,
  op.operator_id AS operator_name
FROM bets b, operators op, users u
WHERE op.id = b.operator_id AND u.id = b.user_id;

  `;
  return await execute(sql);
};



const getOperatorIds = async () => {
  const sql = 'SELECT id FROM operators';
  const rows = await execute(sql);
  console.log("Operator rows:", rows);
  return rows.map(row => row.id); 
};
module.exports = {
  getBetsByMatchAndUser,
  getUserBetsByMatch,
  getMatchMap,
  insertBet,
  insertBetDigits,
  getExistingDigits,
  updateDigitProfit,
  updateWallet,
  getBetsByOperatorId,
  getOperatorIds
};