const TransationService = require("../services/TransactionService");
const { success } = require("../utils/response");

const createTransaction = async (req, res) => {
  try {
    const result = await TransationService.createTransaction(req);
    if (result) {
      return res.status(200).json({ success: true, data: result });
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const createWalletSnapshot = async (req, res) => {
  try {
    const result = await TransationService.createWalletSnapshot(req);
    if (result) {
      return res.status(200).json({ success: true, data: result });
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const placeBet = async (req, res) => {
  try {
    const result = await TransationService.placeBet(req);
    if (result.success === true) {
      return res.status(200).json({
        success: true,
        message: "Bet Placed Successfully",
      });
    }else{
        return res.status(200).json({
        success: false,
        message: "Unable to Place Bet",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server 1 error",
    });
  }
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  placeBet,
};
