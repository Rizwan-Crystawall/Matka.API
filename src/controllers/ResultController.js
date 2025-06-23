const ResultService = require('../services/ResultService');

const saveBetResults = async (req, res) => {
  try {
      console.log("Incoming request body:", req.body); // 
    const result = await ResultService.saveBetResults(req.body);
    return res.status(200).json({ success: true, message: "Bet results saved", result });
  } catch (error) {
    console.error("Error saving bet results:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

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

    console.log("From controller - result_id:", result_id); 

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

module.exports = {
 saveBetResults,
 getAllResults,
 getResultById,
 getMarketById
};