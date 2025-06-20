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

  const getAdminDashboardMarkets = async () => {
  const rows = await MarketModel.getAdminDashboardMarkets();
  return rows;
};

module.exports = {
  getAllMarkets,
  getAdminDashboardMarkets
}
