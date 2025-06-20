const MarketService = require('../services/marketservice');
const response = require("../utils/response"); // adjust path accordingly




const getAllMarkets = async (req, res, next) => {
  try {
    const markets = await MarketService.getAllMarkets();

    if (!markets || markets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No markets available",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Markets retrieved successfully",
      data: markets,
    });
  } catch (error) {
    console.error("Error fetching markets:", error);
    next(error); // Use Express error handler middleware
  }
};
const getAdminDashboardMarkets = async (req, res) => {
  try {
    const markets = await MarketService.getAdminDashboardMarkets();
    res.status(200).json({ success: true, data: markets });
  } catch (error) {
    console.error("Error fetching admin markets:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
module.exports = {
  getAllMarkets,
  getAdminDashboardMarkets
};
