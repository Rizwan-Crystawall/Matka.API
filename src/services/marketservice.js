const MarketModel = require("../modal/marketmodal");

const getAllMarkets = async () => {
    try {
      const markets = await MarketModel.getAllMarkets();
      return markets;
    } catch (error) {
      console.error("MarketService Error:", error);
      throw error;
    }
  };

 const getMarket = async (data) => {
  const rows = await MarketModel.getMarket(data);
  return rows;
};
const addMarket = async (name) => {
  if (!name || name.trim() === "") {
    throw new Error("Market name is required.");
  }

  const existingRows = await MarketModel.checkMarketExists(name.trim());

  if (existingRows.length > 0) {
    return {
      success: false,
      message: "Market name already exists.",
    };
  }

  const result = await MarketModel.addMarket(name.trim());

  return {
    success: true,
    message: "Market added successfully.",
    marketId: result.insertId, // ✅ for controller to use
  };
};
const updateMarket = async (market_id, name, is_active) => {
  const duplicate = await MarketModel.checkDuplicateMarket(name, is_active, market_id);

  if (duplicate.length > 0) {
    throw new Error("Market with the same name and active status already exists.");
  }

  const result = await MarketModel.updateMarket(market_id, name, is_active);
  return result;
};
const deleteMarket = async (id) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid market ID.");
  }

  const result = await MarketModel.deleteMarket(id);
  return result;
};
const getActiveMatchMappings = async () => {
  // You can add additional validation or transformation here if needed
  return await MarketModel.fetchActiveMatchMappings();
};

module.exports = {
  getAllMarkets,
  getMarket,
  addMarket,
  updateMarket,
  deleteMarket,
  getActiveMatchMappings
}
