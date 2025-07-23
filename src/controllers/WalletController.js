const WalletService = require('../services/WalletService');

const getWalletDetails = async (req, res) => {
  try {
    const userId = req.query.user_id; // ← changed from req.body to req.query

    const wallet = await WalletService.getWalletDetails(userId);

    return res.status(200).json({
      success: true,
      message: 'Wallet details fetched successfully',
      data: wallet,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getWalletDetails,
};
