const ResultService = require("../services/ResultService");

// const saveBetResults = async (req, res) => {
//   try {
//       console.log("Incoming request body:", req.body); //
//     const result = await ResultService.saveBetResults(req.body);
//     return res.status(200).json({ success: true, message: "Bet results saved", result });
//   } catch (error) {
//     console.error("Error saving bet results:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

const getAllResults = async (req, res) => {
  try {
    const results = await ResultService.getAllResults();

    return res.status(200).json({
      success: true,
      message: "Results fetched successfully.",
      data: results,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
const getResultById = async (req, res) => {
  try {
    const { result_id } = req.body; // or req.params / req.query depending on how it's sent

    const response = await ResultService.getResultById(result_id);

    return res.status(response.status).json({
      success: response.success,
      message: response.message,
      data: response.data[0] || null,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getMarketById = async (req, res) => {
  try {
    const result = await ResultService.getActiveMatchesWithMarket();

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
const getMatchTypeResults = async (req, res) => {
  try {
    const { match_id } = req.body;

    const result = await ResultService.fetchMatchTypeData(match_id);

    return res.status(200).json({
      success: true,
      message: "Match type mappings with results fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getMatchTypeId = async (req, res) => {
  try {
    const { match_id } = req.body;

    const result = await ResultService.getMatchTypeId(match_id);

    return res.status(200).json({
      success: true,
      message: "Match type mappings with results fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
const saveBetResults = async (req, res) => {
  try {
    const data = req.body;
    await ResultService.saveBetResults(data);
    return res.status(200).json({
      success: true,
      message: "Bet results saved and balances updated.",
    });
  } catch (error) {
    console.error("Error saving bet results:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while saving bet results.",
    });
  }
};

const rollbackBetResults = async (req, res) => {
  try {
    const result = await ResultService.rollBackBetResult(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Rollback Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const publishResults = async (req, res) => {
  try {
    const result = await ResultService.publishResults(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error saving bet results:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const rollbackResults = async (req, res) => {
  try {
    const result = await ResultService.rollbackResults(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Rollback Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const settleBet = async (req, res) => {
  try {
    const settlebet = await ResultService.settleBet(req.body);
    if (settlebet.success)
      res.status(200).json({ success: true, data: settlebet.data });
    else res.status(404).json({ success: false, data: settlebet.data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Unable to settle this Bet",
      error: "Unable to settle this Bet",
    });
  }
};

module.exports = {
  saveBetResults,
  rollbackBetResults,
  getAllResults,
  getResultById,
  getMarketById,
  getMatchTypeResults,
  getMatchTypeId,
  publishResults,
  rollbackResults,
  settleBet,
};
