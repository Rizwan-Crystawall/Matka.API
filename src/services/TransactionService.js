const db = require("../utils/dbHelper");
const TransactionModal = require("../modal/TransactionModal");
const BetsService = require("../services/BetService");
const { success } = require("../utils/response");

const createTransaction = async (req) => {
  return await TransactionModal.createTransaction(req.body);
};

const createWalletSnapshot = async (req) => {
  return await TransactionModal.createWalletSnapshot(req.body);
};

const placeBet = async (req) => {
  try {
    const transction = await TransactionModal.createTransaction(req.body);
    if (transction === 1) {
      let data = {
        operatorId: req.body.operatorId,
        userId: req.body.userId,
        transactionId: req.body.transactionId,
        requestId: req.body.requestId,
        debitAmount: req.body.debitAmount,
      }
      const betPlacable = await BetsService.isThisBetPlacable(data); // /betrequest in original
      // console.log(betPlacable);
      if (betPlacable.status === "RS_OK") {
        const walletSnapshot = await TransactionModal.createWalletSnapshot(
          req.body,
          betPlacable.balance
        );
        if (walletSnapshot === 1) {
          const result = await BetsService.saveUserBetAPI(req.body, betPlacable.clientBetId);
          if (result.success === 1) {
            return { success: true };
          }
        }
      } else {
        // console.log("CONDITION ELSE");
        const transction = await TransactionModal.updateTransaction(req.body);
        if (transction === 1) {
          return { success: false };
        }
      }
    }else{

    }
  } catch (error) {
    // console.log("Rollbacked ALL!!!");
    throw error;
  }
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  placeBet,
};
