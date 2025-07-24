const db = require("../utils/dbHelper");
const TransactionModal = require("../modal/TransactionModal");
const TokenModal = require("../modal/TokenModal");
const BetsService = require("../services/BetService");
const { success } = require("../utils/response");
const { generateSignature } = require("./../utils/security");
const jwt = require("jsonwebtoken");

const axios = require("axios");

const createTransaction = async (req) => {
  return await TransactionModal.createTransaction(req.body);
};

const createWalletSnapshot = async (req) => {
  return await TransactionModal.createWalletSnapshot(req.body);
};

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const placeBet = async (req) => {
  try {
    const transction = await TransactionModal.createTransaction(req.body);
    if (transction === 1) {

      const oid = req.body.operatorId;
      const uid = req.body.userId;
      const opr = await TokenModal.getOperatorDetails(oid);
      let secret = "";
      if (opr.length > 0) {
        secret = opr[0].shared_secret;
      }
      const payloadForToken = {
        oid,
        uid,
        signature: generateSignature(uid, secret),
        iat: Math.floor(Date.now() / 1000),
      };
      const token = jwt.sign(payloadForToken, secret, {
        algorithm: "HS256",
        expiresIn: "1h",
      });
      let data = {
        operatorId: req.body.operatorId,
        userId: req.body.userId,
        token: token,
        transactionId: req.body.transactionId,
        requestId: req.body.requestId,
        debitAmount: req.body.debitAmount,
        betType: capitalize(req.body.type_name),
      };
      const requestUrl = await TransactionModal.getBetRequestUrl(
        req.body.operatorId
      );
      const betPlacable = await axios
        .post(requestUrl, data, {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${process.env.API_TOKEN}`,
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error("Error calling external API:", err.message);
          return { status: "RS_ERROR_UNKNOWN" };
        });
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
  } catch (error) {}
};

module.exports = {
  createTransaction,
  createWalletSnapshot,
  placeBet,
};
