const MatchService = require("../services/matchservice");
const parseJwt = require("../utils/parseJwt"); // if not already required
const response = require("../utils/response"); // adjust path accordingly


const getAllMatches = async (req, res, next) => {
  try {
    const matches = await MatchService.getAllMatches();
    // console.log(res.status);

    if (!matches || matches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no matches available",
      });
    }

    // If matches are found
   return response.success(res, "Matches retrieved successfully", matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    next(error);
  }
};
const getAllMatchTypes = async (req, res, next) => {
  try {
    const matches = await MatchService.fetchAllMatchTypes();
    // console.log(res.status);

    if (!matches || matches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no matches available",
      });
    }

    // If matches are found
   return response.success(res, "Matches retrieved successfully", matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    next(error);
  }
};

const addMatch = async (req, res) => {
  try {
    const {
      market_id,
      name,
      draw_date,
      open_time,
      close_time,
      is_active,
      open_suspend,
      close_suspend,
      match_types,
    } = req.body;

    // Call service to create match
    const result = await MatchService.createMatch({
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

    // If creation failed (e.g., duplicate)
    if (!result.success) {
      return response.badRequest(res, result.message || "Match already exists");
    }

    // Success: Match created
    return response.success(res, "Match added successfully", {
      result,
    });

  } catch (error) {
    console.error("Add Match Error:", error);
    return response.serverError(res, error.message || "Internal Server Error");
  }
};

const getMatchById = async (req, res) => {
   const matchId = parseInt(req.body.match_id);
    if (isNaN(matchId)) {
    return res.status(400).json({ success: false, message: 'Invalid match_id' });
  }

  try {
    const data = await MatchService.getMatchById(matchId);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

   res.json({ success: true, message: 'Match fetched successfully', data });
  } catch (err) {
    console.error('Error in controller:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
const updateMatch = async (req, res) => {
  
  try {
    
    const {
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
    } = req.body;

    const result = await MatchService.updateMatch({
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
    });

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Match updated successfully",
    });
  } catch (error) {
    console.error("Update Match Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MatchService.deleteMatch(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or already deleted" });
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
const getMatchTypes = async (req, res) => {
  try {
    const { match_id } = req.body;

    const result = await MatchService.fetchMatchTypesByMatchId(match_id);

    return res.status(200).json({
      success: true,
      message: "Match type data fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch match type data",
    });
  }
};

module.exports = {
  getAllMatches,
  addMatch,
  updateMatch,
  deleteMatch,
  getMatchById,
  getMatchTypes,
  getAllMatchTypes
};
