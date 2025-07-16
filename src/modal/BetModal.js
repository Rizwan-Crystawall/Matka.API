const { execute } = require("../utils/dbHelper");

const getBetsByMatchAndUser = async (matchId, userId) => {
  const sql = `
    SELECT 
      b.id,
      bd.digit,
      bd.stake,
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

const getBetsByMatchAndUserAPI = async (matchId, userId, operatorId) => {
  const sql = `
    SELECT 
      b.id,
      bd.digit,
      bd.stake,
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
    WHERE mtm.match_id = ? AND b.user_id = ? AND b.operator_id = ? AND b.status_id = 1
  `;
  const rows = await execute(sql, [matchId, userId, operatorId]);
  return rows;
};

const getUserBetsByMatch = async (user_id, match_id) => {
  const sql = `
    SELECT 
      m.name,
      mtm.type_id AS match_map_id,
      b.is_closed_type,
      bd.digit,
      bd.stake,
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

// For Operator API

const getUserBetsByMatchAPI = async (user_id, match_id, operator_id) => {
  const sql = `
    SELECT 
      m.name,
      mtm.type_id AS match_map_id,
      b.is_closed_type,
      bd.digit,
      bd.stake,
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
      AND b.operator_id = ?
      AND b.status_id = 1
  `;

  const rows = await execute(sql, [user_id, match_id, operator_id]);
  return rows;
};

const getMatchMap = async (conn, match_id, type_id) => {
  const sql =
    "SELECT id FROM matches_type_mapping WHERE match_id = ? AND type_id = ?";
  const result = await conn.query(sql, [match_id, type_id]);
  // console.log("getMatchMap result:", result[0][0]);
  return result[0][0] || null;
};

const insertBet = async (conn, data) => {
  // console.log("insertBet data:", data);
  const betSql = `
    INSERT INTO bets (user_id, operator_id, match_map_id, rate, status_id, ip, transaction_id, is_closed_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const betResult = await conn.query(betSql, [
    data.user_id,
    data.operator_id,
    data.match_map_id,
    // data.stake,
    data.rate,
    data.status_id,
    data.ip,
    data.transaction_id,
    data.is_closed_type || 0,
  ]);

  // console.log("insertBet result:", betResult);

  return betResult[0].insertId;
};

const insertBetDigits = async (conn, digitData) => {
  const formatted = digitData.map((d) => [
    d.digit,
    d.bet_id,
    d.stake,
    d.potential_profit,
  ]);
  const sql = `
  INSERT INTO bet_digits (digit, bet_id, stake, potential_profit)
  VALUES ?
`;
  const result = await conn.query(sql, [formatted]);
};

const getExistingDigits = async (
  conn,
  { is_closed_type, match_map_id, user_id }
) => {
  const sql = `
    SELECT bd.id, bd.digit, bd.potential_profit
    FROM bet_digits bd
    JOIN bets b ON b.id = bd.bet_id
    WHERE b.is_closed_type = ? AND b.match_map_id = ? AND b.user_id = ?`;
  return await conn.query(sql, [is_closed_type, match_map_id, user_id]);
};

const updateDigitProfit = async (conn, id, profit) => {
  const sql = "UPDATE bet_digits SET potential_profit = ? WHERE id = ?";
  return await conn.query(sql, [profit, id]);
};

const updateWallet = async (conn, user_id, amount) => {
  const sql = `
    UPDATE wallet
    SET exposure = exposure + ?, wallet_balance = wallet_balance - ?
    WHERE user_id = ?`;
  return await conn.query(sql, [amount, amount, user_id]);
};

const getBetsByOperatorId = async () => {
  const sql = `
  SELECT
  mt.name AS match_map_id,
  mth.id AS match_id,
  mth.name AS match_name,  
  DATE_FORMAT(mth.draw_date, '%d-%m-%Y') AS match_date,
  b.user_id AS user_id,
  b.rate,
  b.id as bet_id,
  st.name AS status_id,
  CASE
    WHEN b.is_closed_type = 0 THEN 'OPEN'
    WHEN b.is_closed_type = 1 THEN 'CLOSE'
    ELSE 'UNKNOWN'
  END AS is_closed_type,
  b.created_on,
  b.operator_id,
  op.operator_id AS operator_name,
  bd.digit,
  bd.stake
  FROM bets b
  LEFT JOIN bet_digits bd ON bd.bet_id = b.id
  LEFT JOIN operators op ON op.id = b.operator_id
  LEFT JOIN users u ON u.id = b.user_id
  JOIN matches_type_mapping mtm ON b.match_map_id = mtm.id
  JOIN match_types mt ON mtm.type_id = mt.id
  JOIN matches mth ON mtm.match_id = mth.id
  JOIN status st ON st.id = b.status_id
  ORDER BY b.created_on DESC;
  `;
  return await execute(sql);
};

const getOperatorIds = async () => {
  const sql = "SELECT id FROM operators";
  const rows = await execute(sql);
  console.log("Operator rows:", rows);
  return rows.map((row) => row.id);
};

const insertBetAPI = async (conn, data) => {
  // console.log("insertBet API data:", data);
  const betSql = `
    INSERT INTO bets (user_id, operator_id, match_map_id, rate, status_id, ip, transaction_id, client_bet_id, is_closed_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const betResult = await conn.query(betSql, [
    data.userId,
    data.operatorId,
    data.match_map_id,
    // data.stake,
    data.rate,
    data.status_id,
    data.ip,
    data.transactionId,
    data.clientBetId,
    data.is_closed_type || 0,
  ]);

  // console.log("insertBet result:", betResult);

  return betResult[0].insertId;
};

const fetchDigitStats = async (matchTypeId) => {
  const sql = `
    SELECT bd.digit, COUNT(bd.bet_id) AS total_bets_on_digit, COUNT(DISTINCT b.user_id) AS unique_users_on_digit, SUM(bd.stake) AS total_stake_on_digit FROM bet_digits bd JOIN bets b ON bd.bet_id = b.id JOIN matches_type_mapping mtm ON b.match_map_id = mtm.id JOIN match_types mt ON mtm.type_id = mt.id WHERE mt.id = ? GROUP BY bd.digit
  `;

  return await execute(sql, [matchTypeId]);
};

const getUniqueClients = async (digit) => {
  const sql = `
  SELECT b.operator_id,op.operator_id,b.user_id 
  FROM bets b 
  JOIN operators op ON op.id = b.operator_id
  JOIN bet_digits bd ON b.id = bd.bet_id 
  AND bd.digit = ?;
  `;
  return await execute(sql, [digit]);
};

const getTotalNumberOfBets = async (digit) => {
  const sql = `
    SELECT b.id,bd.stake,bd.bet_id,b.user_id,b.rate,b.bet_time,b.ip,m.name,CASE 
      WHEN b.is_closed_type = 0 THEN 'OPEN'
      WHEN b.is_closed_type = 1 THEN 'CLOSE'
      ELSE 'UNKNOWN'
      END AS bet_type FROM bet_digits bd
      JOIN bets b ON bd.bet_id = b.id
      JOIN matches_type_mapping mtm ON mtm.id=b.match_map_id
      JOIN matches m ON m.id = mtm.match_id
      WHERE  bd.digit = ?;
  `;
  return await execute(sql, [digit]);
};

const createBetSettlementsEntry = async (data) => {
  // console.log("HERE IN BET MODAL FOR INITIAL ENTRY");
  // console.log(data);

  const sql = `
   INSERT INTO bet_settlements (request_id, transaction_id, operator_id, status, payload, retry_count)
   VALUES (?,?,?,?,?,?)
  `;
  const result = await execute(sql, [
    data.request_id,
    data.transaction_id,
    data.operator_id,
    data.status,
    JSON.stringify(data.payload),
    data.retry_count,
    // data.failed_bets,
  ]);
  return result.affectedRows;
};

const updateBetSettlementsRetryCount = async (request_id) => {
  const sql = `
    UPDATE bet_settlements
    SET retry_count = retry_count + 1
    WHERE request_id = ?`;
  return await execute(sql, [request_id]);
};

const updateBetSettlementsWithReqId = async (request_id, status, failed_bets) => {
  // console.log("updateBetSettlementsWithReqId");
  const sql = `
    UPDATE bet_settlements
    SET retry_count = retry_count + 1, status = ?, failed_bets = ?
    WHERE request_id = ?`;
  await execute(sql, [status, JSON.stringify(failed_bets), request_id]);
};

const getBatchByRequestId = async (request_id) => {
  const sql = `
    SELECT bs.id, bs.request_id, bs.transaction_id, bs.operator_id, bs.payload, bs.status, bs.retry_count, bs.last_attempt, bs.failed_bets, op.callback_url FROM bet_settlements bs, operators op WHERE bs.operator_id = op.id AND bs.request_id = ?
  `;

  return await execute(sql, [request_id]);
};

const getCallbackUrl = async (operator_id) => {
  const url = await execute(`SELECT * from operators where id = ?`, [operator_id]);
 return url[0] || [];
};

module.exports = {
  getBetsByMatchAndUser,
  fetchDigitStats,
  getUserBetsByMatch,
  getMatchMap,
  insertBet,
  insertBetAPI,
  insertBetDigits,
  getExistingDigits,
  updateDigitProfit,
  updateWallet,
  getBetsByOperatorId,
  getOperatorIds,
  getUniqueClients,
  getTotalNumberOfBets,
  getBetsByMatchAndUserAPI,
  getUserBetsByMatchAPI,
  createBetSettlementsEntry,
  updateBetSettlementsRetryCount,
  updateBetSettlementsWithReqId,
  getBatchByRequestId,
  getCallbackUrl,
};
