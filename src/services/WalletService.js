const WalletModal = require('../modal/WalletModal');

const getWalletDetails = async (userId) => {
  if (!userId || isNaN(userId)) {
    throw new Error('Invalid user ID');
  }
  const walletData = await WalletModal.getWalletByUserId(userId);
  if (!walletData) {
    throw new Error('Wallet not found');
  }

  return walletData;
};

module.exports = {
  getWalletDetails,
};
