const WalletService = require('../services/WalletService');

const getWalletDetails = async (req, res) => {
  try {
    const userId = req.body.user_id;    
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
