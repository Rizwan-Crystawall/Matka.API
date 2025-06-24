const { execute } = require("../utils/dbHelper");


const insertOrUpdateResults = async (values) => {
  // if (!values.length) return;  

  const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");

  const flatValues = values.reduce((acc, curr) => acc.concat(curr), []);

  const sql = `
    INSERT INTO results (match_map_id, open_result, close_result, created_by)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      open_result = VALUES(open_result),
      close_result = VALUES(close_result)
  `;

  await execute(sql,flatValues);
};


const fetchBets = async (digit, mmid, isClosedType) => {
  const rows = await execute(
    `SELECT b.id AS bet_id, b.user_id, b.stake, COUNT(bd_all.id) AS digit_count,
            b.stake * COUNT(bd_all.id) AS total_stake_against_bet,
            bd_win.potential_profit AS winning_potential_profit
     FROM bets b
     JOIN bet_digits bd_all ON b.id = bd_all.bet_id
     LEFT JOIN bet_digits bd_win ON b.id = bd_win.bet_id AND bd_win.digit = ?
     WHERE b.match_map_id = ? AND b.is_closed_type = ? AND b.status_id = 1
     GROUP BY b.id, b.user_id, b.stake, bd_win.potential_profit`,
    [digit, mmid, isClosedType]
  );
  return rows;
};

const updateWinnerWallet = async (user_id, totalProfit, total_stake) => {
  await execute(
    `UPDATE wallet
     SET wallet_balance = wallet_balance + ?, exposure = exposure - ?
     WHERE user_id = ?`,
    [totalProfit, total_stake, user_id]
  );
};

const updateLoserWallet = async (user_id, total_stake) => {
  await execute(
    `UPDATE wallet SET exposure = exposure - ? WHERE user_id = ?`,
    [total_stake, user_id]
  );
};

const updateBetsStatus = async (mmid, isClosedType) => {
  await execute(
    `UPDATE bets SET status_id = 2 WHERE match_map_id = ? AND is_closed_type = ?`,
    [mmid, isClosedType]
  );
};



const getAllResults = async () => {
  const sql = `
SELECT max(res.id), mkt.name as marketname,m.id as mid, m.name as matchname, DATE_FORMAT(m.draw_date, '%d-%m-%Y') AS matchdate, CASE WHEN m.is_active = 1 THEN 'Active' ELSE 'Inactive' END AS status FROM results res, matches_type_mapping mtm, matches m,markets mkt WHERE mtm.id=res.match_map_id AND m.id=mtm.match_id AND m.market_id =mkt.id GROUP BY m.id ORDER by max(res.id) DESC  `;

  const rows = await execute(sql);
  return rows;
};
const fetchResultByMatchId = async (result_id) => {
  const sql = `
   SELECT r.id,mkt.name as marname,m.name as matname,mt.name as matchtype,DATE_FORMAT(m.draw_date, '%d-%m-%Y') AS draw_date,r.open_result,r.close_result,r.result_date FROM results r, matches m, matches_type_mapping mtm,markets mkt,match_types mt WHERE r.match_map_id=mtm.id AND mtm.match_id=m.id AND mkt.id=m.market_id AND mt.id=mtm.type_id AND r.id = ?
  `;

  const rows = await execute(sql, [result_id]);
  return rows;
};
const fetchMarketByMatchId = async () => {
  const sql = `SELECT m.market_id, mkt.name as marketname, m.id as match_id, m.name as matchname, DATE_FORMAT(m.draw_date,"%d-%m-%Y") as draw_date FROM matches m, markets mkt WHERE mkt.id=m.market_id AND m.is_active=1 AND m.is_deleted=0 AND mkt.is_active=1 ORDER BY m.market_id,m.id`;

  const rows = await execute(sql);
  return rows;
};
const fetchMatchTypeData = async (matchId) => {
  const sql = `
    SELECT 
      mtm.id AS mmid, 
      mtm.type_id, 
      res.match_map_id, 
      mtm.match_id, 
      res.open_result, 
      res.close_result 
    FROM 
      matches_type_mapping mtm 
    LEFT JOIN 
      results res 
    ON 
      mtm.id = res.match_map_id 
    WHERE 
      mtm.match_id = ?
  `;
  const rows = await execute(sql, [matchId]);
  return rows;
};
const getMatchTypeResults = async (match_id) => {
  const sql = `
    SELECT 
      mtm.id AS mmid,
      mtm.type_id,
      res.match_map_id,
      m.market_id,
      mkt.name AS marketname,
      mtm.match_id,
      m.name AS match_title,
      DATE_FORMAT(m.draw_date, '%d-%m-%Y') AS matchdate,
      mtm.type_id,
      res.open_result,
      res.close_result
    FROM matches_type_mapping mtm
    LEFT JOIN results res ON mtm.id = res.match_map_id
    LEFT JOIN matches m ON mtm.match_id = m.id
    LEFT JOIN markets mkt ON m.market_id = mkt.id
    WHERE mtm.match_id = ?
  `;

  const rows = await execute(sql, [match_id]);
  return rows;
};


module.exports = {
  getAllResults,
  fetchResultByMatchId,
  fetchMarketByMatchId,
  fetchMatchTypeData,
  getMatchTypeResults,
    insertOrUpdateResults,
  fetchBets,
  updateWinnerWallet,
  updateLoserWallet,
  updateBetsStatus,
};
