const Match = require("../modal/matchmodal");

const getAllMatches = async () => {
  const profile = await Match.getAllMatches();

  if (!profile || profile.length === 0) {
    return {
      success: false,
      message: "User not found or no matches available",
    };
  }

  const user = profile[0];
  const s_id = user.u_role === 6 ? user.parent_id : user.id;

  const match = await Match.getAllMatches(s_id);
  return match;
};
const fetchAllMatchTypes = async () => {
  return await Match.getAllMatchTypes();
};
const createMatch = async ({
  market_id,
  name,
  draw_date,
  open_time,
  close_time,
  is_active,
  open_suspend,
  close_suspend,
  match_types = [], 
}) => {
  return await Match.insertMatch({
    market_id,
    name,
    draw_date,
    open_time,
    close_time,
    is_active,
    open_suspend,
    close_suspend,
    match_types, 
  });
};
const getMatchById = async (matchId) => {
  try {
    return await Match.fetchMatchById(matchId);
  } catch (err) {
    console.error('Service error:', err.message);
    throw err;
  }
}

const updateMatch = async (id) => {
  
  try {
    const result = await Match.updateMatch(id);
    return result;
  } catch (error) {
    console.error('Match Service Update Error:', error);
    throw error;
  }
};
const deleteMatch = async (id) => {
  return await Match.deleteMatch(id);
};
const fetchMatchTypesByMatchId = async (matchId) => {
  if (!matchId || isNaN(matchId)) {
    throw new Error("Invalid match ID");
  }

  const data = await Match.getMatchTypesByMatchId(matchId);
  return data;
};

const fetchAllMatchTypes = async () => {
  return await Match.getAllMatchTypes();
};

module.exports = {
  getAllMatches,
  fetchAllMatchTypes,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatchById,
  fetchMatchTypesByMatchId,
  fetchAllMatchTypes
};
