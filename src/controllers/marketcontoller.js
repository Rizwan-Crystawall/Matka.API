const MarketService = require('../services/marketservice');
const response = require("../utils/response"); // adjust path accordingly
const statusCodes = require("../utils/statusCodes");



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
const getMarket = async (req, res) => {
  try {
    const markets = await MarketService.getMarket();
    res.status(200).json({ success: true, data: markets });
  } catch (error) {
    console.error("Error fetching admin markets:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addMarket = async (req, res) => {
 try {
    const { name } = req.body;

    const result = await MarketService.addMarket(name);    
 if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json({
      success: true,
      message: "Market added successfully.",
      marketId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding market:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
const updateMarket = async (req, res) => {
  try {    
    const { market_id, name, status } = req.body;
     const is_active = status;

    const result = await MarketService.updateMarket(market_id, name, is_active);

    return res.status(200).json({
      success: true,
      message: "Market updated successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteMarket = async (req, res) => {
  try {
    const { delete_market_id } = req.body;

    await MarketService.deleteMarket(delete_market_id);

    res.status(200).json({
      success: true,
      message: "Market deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting market:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
const getActiveMatchMappings = async (req, res) => {
  try {
    const result = await MarketService.getActiveMatchMappings();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching match mappings",
      error: error.message,
    });
  }
};

const getActiveMatchMappingsAPI = async (req, res) => {
  try {
    const result = await MarketService.getActiveMatchMappings();

    return res.status(200).json({
      status: "RS_OK",
      message: statusCodes.RS_OK,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching match mappings",
      error: error.message,
    });
  }
};

const getMarketsByOperator = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required",
      });
    }
    let iframeSrc = `http://localhost:3000/user/home/api/${username}`;
    res.send(
      `<iframe src="${iframeSrc}" height="800px" width="1500px"></iframe>`
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllMarkets,
  addMarket,
  getMarket,
  updateMarket,
  deleteMarket,
  getActiveMatchMappings,
  getMarketsByOperator,
  getActiveMatchMappingsAPI,
};
