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
        transaction_id: req.body.transaction_id,
        request_id: req.body.request_id,
        debit_amount: req.body.debit_amount,
        user_id: req.body.user_id
      }
      // console.log(data);return;
      const betPlacable = await BetsService.isThisBetPlacable(data);
      if (betPlacable.success === true) {
        const walletSnapshot = await TransactionModal.createWalletSnapshot(
          req.body,
          betPlacable.data.balance
        );
        if (walletSnapshot === 1) {
          const result = await BetsService.saveUserBetAPI(req.body);
          if (result.success === 1) {
            return { success: true };
          }
        }
      } else {
        const transction = await TransactionModal.updateTransaction(req.body);
        if (transction === 1) {
          return { success: false };
        }
      }
    }
  } catch (error) {
    console.log("Rollbacked ALL!!!");
    throw error;
  }
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  placeBet,
};
