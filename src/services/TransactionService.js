const db = require("../utils/dbHelper");
const TransactionModal = require("../modal/TransactionModal");
const BetsService = require("../services/BetService");
const { success } = require("../utils/response");

const axios = require('axios');

const createTransaction = async (req) => {
  return await TransactionModal.createTransaction(req.body);
};

const createWalletSnapshot = async (req) => {
  return await TransactionModal.createWalletSnapshot(req.body);
};

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
        betType: capitalize(req.body.type_name),
      };
      // console.log(data);return;
      // const betPlacable = await BetsService.isThisBetPlacable(data); // /betrequest in original
      const betPlacable = await axios
        .post("http://100.28.41.166:9010/placebet", data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.API_TOKEN}`, // optional
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error("Error calling external API:", err.message);
          return { status: "RS_ERROR_UNKNOWN" };
        });

      // console.log(betPlacable);
      if (betPlacable.status === "RS_OK") {
        const walletSnapshot = await TransactionModal.createWalletSnapshot(
          req.body,
          betPlacable.balance
        );
        if (walletSnapshot === 1) {
          const result = await BetsService.saveUserBetAPI(
            req.body,
            betPlacable.clientBetId
          );
          if (result.success === 1) {
            return { success: true, status: "RS_OK" };
          }
        }
      } else {
        const transction = await TransactionModal.updateTransaction(req.body);
        if (transction === 1) {
          return { success: false, status: betPlacable.status };
        }
      }
    } else {
    }
  } catch (error) {
  }
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  placeBet,
};
