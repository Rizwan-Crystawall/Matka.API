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
  //   const connection = await db.beginTransaction();
  try {
    // console.log("Transaction Service 1");
    const transction = await TransactionModal.createTransaction(req.body);
    // console.log("Transction");
    // console.log(transction);
    if (transction === 1) {
      const betPlacable = await BetsService.isThisBetPlacable(req.body);
      if (betPlacable.success === true) {
        // console.log("CAN BET PLACE");
        const walletSnapshot = await TransactionModal.createWalletSnapshot(
          req.body
        );
        // console.log("walletSnapshot");
        // console.log(walletSnapshot);
        if (walletSnapshot === 1) {
          //   console.log("CAN SAVE BET NOW");
          const result = await BetsService.saveUserBetAPI(req.body);
        //   console.log("BET SAVED");
        //   console.log(result);
          if (result.success===1) {
            // res.status(200).json({
            //   success: true,
            //   message: "Bet saved successfully",
            //   data: result,
            // });
            return {success: true};
          }
        }
      }
    }

    // await db.commit(connection);
  } catch (error) {
    console.log("Rollbacked ALL!!!");
    // await db.rollback(connection);
    throw error;
  }
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  placeBet,
};
