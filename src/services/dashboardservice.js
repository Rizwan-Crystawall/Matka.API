const DashboardModel = require("../modal/DashboardModal");

const fetchDashboardStats = async () => {
  const stats = await DashboardModel.getDashboardStats();
  return stats;
};
// const DashboardModel = require("../models/dashboard.model");

const fetchMarketwiseDashboard = async () => {
  return await DashboardModel.getDashboardDataMarketwise();
};

const fetchBetTypeDistribution = async () => {
  return await DashboardModel.getBetTypeDistribution();
};


const fetchRecentMatches = async () => {
  return await DashboardModel.getRecentMatches();
};




module.exports = { fetchDashboardStats,fetchMarketwiseDashboard,fetchBetTypeDistribution,fetchRecentMatches};
