const DashboardService = require("../services/dashboardservice");

const getDashboardData = async (req, res, next) => {
  try {
    const stats = await DashboardService.fetchDashboardStats();
    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in dashboard controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};


const getMarketwiseDashboardData = async (req, res) => {
  try {
    const stats = await DashboardService.fetchMarketwiseDashboard();
    res.status(200).json({
      success: true,
      message: "Market-wise stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching market-wise stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch market-wise dashboard data",
    });
  }
};



const getBetTypeDistribution = async (req, res) => {
  try {
    const data = await DashboardService.fetchBetTypeDistribution();
    res.status(200).json({
      success: true,
      message: "Bet type distribution fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching bet type distribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bet type distribution",
    });
  }
};


const getRecentMatches = async (req, res) => {
  try {
    const data = await DashboardService.fetchRecentMatches();
    res.status(200).json({
      success: true,
      message: "Recent matches fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching recent matches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent matches",
    });
  }
};


module.exports = { getDashboardData,getMarketwiseDashboardData,getBetTypeDistribution,getRecentMatches };
