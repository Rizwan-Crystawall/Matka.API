const { execute } = require("../utils/dbHelper");

const insertOrUpdateResults = async (conn, values) => {
  const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");

  const flatValues = values.reduce((acc, curr) => acc.concat(curr), []);

  const sql = `
    INSERT INTO results (match_map_id, open_result, close_result, created_by)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      open_result = VALUES(open_result),
      close_result = VALUES(close_result)
  `;

  await conn.query(sql, flatValues);
};

const fetchBets = async (conn, digit, mmid, isClosedType) => {
  // const rows = await conn.query(
  //   `SELECT b.id AS bet_id, b.user_id, b.stake, COUNT(bd_all.id) AS digit_count,
  //           b.stake * COUNT(bd_all.id) AS total_stake_against_bet,
  //           bd_win.potential_profit AS winning_potential_profit
  //    FROM bets b
  //    JOIN bet_digits bd_all ON b.id = bd_all.bet_id
  //    LEFT JOIN bet_digits bd_win ON b.id = bd_win.bet_id AND bd_win.digit = ?
  //    WHERE b.match_map_id = ? AND b.is_closed_type = ? AND b.status_id = 1
  //    GROUP BY b.id, b.user_id, b.stake, bd_win.potential_profit`,
  //   [digit, mmid, isClosedType]
  // );
  // console.log("Fetch Bets");
  const rows = await conn.query(
    `SELECT b.operator_id, b.user_id, b.id AS bet_id,b.client_bet_id, bd_all.id as bet_digits_id, bd_all.digit, bd_all.stake, bd_win.potential_profit as winning_potential_profit FROM bets b JOIN bet_digits bd_all ON b.id = bd_all.bet_id LEFT JOIN bet_digits bd_win ON b.id = bd_win.bet_id AND bd_win.digit = ? WHERE b.match_map_id = ? AND b.is_closed_type = ? AND b.status_id = 1;`,
    [digit, mmid, isClosedType]
  );

  return rows[0] || [];
};

const fetchBetsAPI = async (conn, digit, mmid, isClosedType) => {
  // const rows = await conn.query(
  //   `SELECT b.id AS bet_id, b.user_id, b.stake, COUNT(bd_all.id) AS digit_count,
  //           b.stake * COUNT(bd_all.id) AS total_stake_against_bet,
  //           bd_win.potential_profit AS winning_potential_profit
  //    FROM bets b
  //    JOIN bet_digits bd_all ON b.id = bd_all.bet_id
  //    LEFT JOIN bet_digits bd_win ON b.id = bd_win.bet_id AND bd_win.digit = ?
  //    WHERE b.match_map_id = ? AND b.is_closed_type = ? AND b.status_id = 1
  //    GROUP BY b.id, b.user_id, b.stake, bd_win.potential_profit`,
  //   [digit, mmid, isClosedType]
  // );
  // console.log("Fetch Bets");
  const rows = await conn.query(
    `SELECT b.operator_id, b.user_id, b.id AS bet_id,b.client_bet_id, bd_all.id as bet_digits_id, bd_all.digit, bd_all.stake, bd_win.potential_profit as winning_potential_profit FROM bets b JOIN bet_digits bd_all ON b.id = bd_all.bet_id LEFT JOIN bet_digits bd_win ON b.id = bd_win.bet_id AND bd_win.digit = ? WHERE b.match_map_id = ? AND b.is_closed_type = ? AND b.status_id = 1 AND b.operator_id;`,
    [digit, mmid, isClosedType]
  );

  return rows[0] || [];
};

const fetchBetsAPIForROllback = async (conn, digit, mmid, isClosedType) => {
  const rows = await conn.query(
    `SELECT b.operator_id, b.user_id, b.id AS bet_id,b.client_bet_id, bd_all.id as bet_digits_id, bd_all.digit, bd_all.stake, bd_win.potential_profit as winning_potential_profit FROM bets b JOIN bet_digits bd_all ON b.id = bd_all.bet_id LEFT JOIN bet_digits bd_win ON b.id = bd_win.bet_id AND bd_win.digit = ? WHERE b.match_map_id = ? AND b.is_closed_type = ? AND b.status_id IN (2,3) AND b.operator_id;`,
    [digit, mmid, isClosedType]
  );
  return rows[0] || [];
};

const updateWinnerWallet = async (conn, user_id, totalProfit, total_stake) => {
  await conn.query(
    `UPDATE wallet
     SET wallet_balance = wallet_balance + ?, exposure = exposure - ?
     WHERE user_id = ?`,
    [totalProfit, total_stake, user_id]
  );
};

const updateLoserWallet = async (conn, user_id, total_stake) => {
  await conn.query(
    `UPDATE wallet SET exposure = exposure - ? WHERE user_id = ?`,
    [total_stake, user_id]
  );
};

const updateBetsStatus = async (conn, mmid, isClosedType) => {
  await conn.query(
    `UPDATE bets SET status_id = 2 WHERE match_map_id = ? AND is_closed_type = ?`,
    [mmid, isClosedType]
  );
};

const updateBetsStatusAPI = async (conn, winningBets, losingBets) => {
  try {
    if (winningBets.length > 0) {
      const [res1] = await conn.query(
        `UPDATE bets SET status_id = 2 WHERE id IN (?)`,
        [winningBets]
      );
      console.log("Winning bets updated:", res1.affectedRows);
    }

    if (losingBets.length > 0) {
      const [res2] = await conn.query(
        `UPDATE bets SET status_id = 3 WHERE id IN (?)`,
        [losingBets]
      );
      console.log("Losing bets updated:", res2.affectedRows);
    }
  } catch (err) {
    console.error("Error updating bets:", err);
  }
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
  const sql = `SELECT m.market_id, mkt.name as marketname, m.id as match_id, m.name as matchname, DATE_FORMAT(m.draw_date,"%d-%m-%Y") as draw_date FROM matches m, markets mkt WHERE mkt.id=m.market_id AND m.is_active=1 AND m.is_deleted=0 AND mkt.is_active=1 AND mkt.is_deleted=0 ORDER BY m.market_id,m.id`;

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
const fetchRollbackBets = async (conn, digit, mmid, isClosedType) => {
  // const sql = `
  //   SELECT b.id AS bet_id, b.user_id, b.stake,
  //          COUNT(bd_all.id) AS digit_count,
  //          b.stake * COUNT(bd_all.id) AS total_stake_against_bet,
  //          bd_win.potential_profit AS winning_potential_profit
  //   FROM bets b
  //   JOIN bet_digits bd_all ON b.id = bd_all.bet_id
  //   LEFT JOIN bet_digits bd_win ON b.id = bd_win.bet_id AND bd_win.digit = ?
  //   WHERE b.match_map_id = ? AND b.is_closed_type = ? AND b.status_id = 2
  //   GROUP BY b.id, b.user_id, b.stake, bd_win.potential_profit
  // `;

  const rows = await conn.query(
    `SELECT b.user_id, b.id AS bet_id, bd_all.id as bet_digits_id, bd_all.digit, bd_all.stake, bd_win.potential_profit as winning_potential_profit FROM bets b JOIN bet_digits bd_all ON b.id = bd_all.bet_id LEFT JOIN bet_digits bd_win ON b.id = bd_win.bet_id AND bd_win.digit = ? WHERE b.match_map_id = ? AND b.is_closed_type = ? AND b.status_id = 2;`,
    [digit, mmid, isClosedType]
  );

  // const rows = await conn.query(sql, [digit, mmid, isClosedType]);
  return Array.isArray(rows) ? rows[0] : []; // <-- Ensure always array
};
const groupBetsByUser = (bets) => {
  if (!Array.isArray(bets) || bets.length === 0) {
    return {
      success: false,
      message: "No bets found to rollback.",
    };
  }
  // return Object.values(
  //   bets.reduce((acc, curr) => {
  //     if (!acc[curr.user_id]) {
  //       acc[curr.user_id] = {
  //         user_id: curr.user_id,
  //         total_stake: 0,
  //         profit: null,
  //       };
  //     }

  //     acc[curr.user_id].total_stake += parseFloat(
  //       curr.total_stake_against_bet || 0
  //     );

  //     if (
  //       acc[curr.user_id].profit === null &&
  //       curr.winning_potential_profit !== null
  //     ) {
  //       acc[curr.user_id].profit = parseFloat(curr.winning_potential_profit);
  //     }

  //     return acc;
  //   }, {})
  // );
  return Object.values(
    bets.reduce((acc, curr) => {
      const userId = curr.user_id;

      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          total_stake: 0,
          profit: null,
        };
      }

      acc[userId].total_stake += parseFloat(curr.stake);

      if (
        acc[userId].profit === null &&
        curr.winning_potential_profit !== null
      ) {
        acc[userId].profit = parseFloat(curr.winning_potential_profit);
      }

      return acc;
    }, {})
  );
};
const rollbackWinner = async (conn, user_id, total, stake) => {
  await conn.query(
    `UPDATE wallet SET wallet_balance = wallet_balance - ?, exposure = exposure + ? WHERE user_id = ?`,
    [total, stake, user_id]
  );
};
const rollbackLoser = async (conn, user_id, stake) => {
  await conn.query(
    `UPDATE wallet SET exposure = exposure + ? WHERE user_id = ?`,
    [stake, user_id]
  );
};

const resetBetStatus = async (conn, mmid, isClosedType) => {
  await conn.query(
    `UPDATE bets SET status_id = 1 WHERE match_map_id = ? AND is_closed_type = ?`,
    [mmid, isClosedType]
  );
};

const clearResult = async (conn, mmid, isClosedType) => {
  const field = isClosedType === 0 ? "open_result" : "close_result";
  await conn.query(
    `UPDATE results SET ${field} = NULL WHERE match_map_id = ?`,
    [mmid]
  );
};

const getOperatorUrls = async () => {
  const rows = await execute(
    "SELECT id, operator_id, callback_url FROM operators"
  );
  return Object.fromEntries(
    rows.map((row) => [row.id.toString(), row.callback_url])
  );
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
  fetchRollbackBets,
  groupBetsByUser,
  rollbackWinner,
  rollbackLoser,
  resetBetStatus,
  clearResult,
  getOperatorUrls,
  fetchBetsAPI,
  updateBetsStatusAPI,
  fetchBetsAPIForROllback,
};
