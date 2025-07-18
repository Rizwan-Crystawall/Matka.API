const TransationService = require("../services/TransactionService");
const { success } = require("../utils/response");
const statusCodes = require("../utils/statusCodes");

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
    if (result.status === "RS_OK") {
      return res.status(200).json({
        status: "RS_OK",
        message: statusCodes.RS_OK,
      });
    }else{
        return res.status(200).json({
        status: result.status,
        message: statusCodes[result.status] || "Unknown status",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  placeBet,
};
