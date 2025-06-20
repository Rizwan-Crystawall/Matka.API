const { execute } = require("../utils/dbHelper");

const getAllMatches = async () => {
  const sql = `
    SELECT 
      m.id, 
      m.name, 
      m.market_id, 
      DATE_FORMAT(m.draw_date, '%d-%m-%Y') AS matchDate,
       CASE   
    WHEN m.is_active = 1 THEN 'active'
    ELSE 'inactive'
  END AS status, 
      mar.name AS marketname,
      GROUP_CONCAT(mt.name ORDER BY mt.name SEPARATOR ', ') AS bettype
    FROM 
      matches m
    JOIN 
      markets mar ON m.market_id = mar.id
    LEFT JOIN 
      matches_type_mapping mtm ON m.id = mtm.match_id
    LEFT JOIN 
      match_types mt ON mtm.type_id = mt.id
    WHERE 
      m.is_deleted = 0
    GROUP BY 
      m.id, m.name, m.market_id, m.draw_date, m.is_active, m.is_deleted, mar.name
      ORDER BY 
    m.draw_date DESC;
  `;
  const rows = await execute(sql);
  return rows;
};

const insertMatch = async ({
  market_id,
  name,
  draw_date,
  open_time,
  close_time,
  is_active,
  open_suspend,
  close_suspend,
  match_types,
}) => {
  try {
    // ✅ Step 1: Check if an exact same match exists
    const checkSQL = `
      SELECT id FROM matches
      WHERE name = ? AND draw_date = ? AND open_time = ? AND close_time = ?
    `;
    const [existingMatch] = await execute(checkSQL, [
      name,
      draw_date,
      open_time,
      close_time,
    ]);

     if (existingMatch) {
      return {
        success: false,
        message: "Match with same name, date, and times already exists.",
      };
    }

    // ✅ Step 2: Insert match
    const insertMatchSQL = `
      INSERT INTO matches (
        market_id, name, draw_date, open_time, close_time,
        is_active, open_suspend, close_suspend
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await execute(insertMatchSQL, [
      market_id,
      name,
      draw_date,
      open_time,
      close_time,
      is_active,
      open_suspend,
      close_suspend,
    ]);

    const matchId = result.insertId;
    if (!matchId) throw new Error("Match insertion failed.");

    for (const mt of match_types) {
      const insertTypeSQL = `
        INSERT INTO matches_type_mapping (
          match_id, type_id, rate, max_stake, min_stake
        ) VALUES (?, ?, ?, ?, ?)
      `;
      await execute(insertTypeSQL, [
        matchId,
        mt.type_id,
        mt.rate,
        mt.max_stake,
        mt.min_stake,
      ]);
    }

     return {
      success: true,
      message: "Match added successfully.",
      match_id: matchId,
    };
  } catch (err) {
    console.error("Insert Match Error:", err.message);
    throw err;
  }
};


const updateMatch = async ({
  id,
  market_id,
  name,
  draw_date,
  open_time,
  close_time,
  is_active,
  open_suspend,
  close_suspend,
  match_types,
}) => {
  // return;
  const updateMatchSQL = `
    UPDATE matches
    SET market_id = ?, name = ?, draw_date = ?, open_time = ?, close_time = ?, is_active = ?, open_suspend = ?, close_suspend = ? WHERE id = ?
  `;

  await execute(updateMatchSQL, [
    market_id,
    name,
    draw_date,
    open_time,
    close_time,
    is_active,
    open_suspend,
    close_suspend,
    id,
  ]);

  const upsertMappingSQL = `
  INSERT INTO matches_type_mapping (match_id, type_id, rate, max_stake, min_stake)
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    rate = VALUES(rate),
    max_stake = VALUES(max_stake),
    min_stake = VALUES(min_stake)
`;


  for (const type of match_types) {
    await execute(upsertMappingSQL, [
      id,
      type.type_id,
      type.rate,
      type.max_stake,
      type.min_stake,
    ]);
  }

  return true;
};


const fetchMatchById = async (matchId) => {
  const sql = `
    SELECT 
      m.market_id,
      mk.name AS marketname,
      m.name,
      DATE_FORMAT(m.draw_date, '%Y-%m-%d') AS draw_date,
      m.open_time,
      m.close_time,
      m.is_active,
      m.open_suspend,
      m.close_suspend,
      mtm.type_id,
      mtm.rate,
      mtm.min_stake,
      mtm.max_stake,
            EXISTS (
        SELECT 1
        FROM matches_type_mapping mtm2
        JOIN bets b ON b.match_map_id = mtm2.id
        WHERE mtm2.match_id = m.id
      ) AS has_bets

    FROM matches m
    JOIN matches_type_mapping mtm ON m.id = mtm.match_id
    JOIN markets mk ON m.market_id = mk.id
    WHERE m.id = ?
  `;
  return await execute(sql, [matchId]);
};

const deleteMatch = async (id) => {
  try {
    console.log("Soft deleting match with ID:", id);

    // Soft delete the match
    const matchSql = `UPDATE matches SET is_deleted = 1 WHERE id = ?`;
    const matchResult = await execute(matchSql, [id]);

    return matchResult.affectedRows > 0;
  } catch (error) {
    console.error("Error soft deleting match and mappings:", error.message);
    return false;
  }
};

module.exports = {
  getAllMatches,
  insertMatch,
  updateMatch,
  deleteMatch,
  fetchMatchById,
};
