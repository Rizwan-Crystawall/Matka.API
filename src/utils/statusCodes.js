// utils/statusCodes.js

const STATUS_CODES = {
  RS_OK: "Completed Successfully",
  RS_ERROR_UNKNOWN: "General Error",
  RS_ERROR_TOKEN_NOT_FOUND: "Token is not found",
  RS_ERROR_USER_BLOCKED: "User has been blocked",
  RS_ERROR_USER_DISABLED: "User is disabled",
  RS_ERROR_INVALID_PARTNER: "Partner is not valid",
  RS_ERROR_INVALID_TOKEN: "Token is not valid",
  RS_ERROR_INVALID_GAME: "Game is not valid",
  RS_ERROR_WRONG_CURRENCY: "Selected currency is wrong",
  RS_ERROR_NOT_ENOUGH_MONEY: "Money is not sufficient",
  RS_ERROR_INVALID_SIGNATURE: "Signature is not valid",
  RS_ERROR_TOKEN_EXPIRED: "Token is expired",
  RS_ERROR_WRONG_SYNTAX: "Syntax is wrong",
  RS_ERROR_WRONG_TYPES: "Types of parameters in request are wrong",
  RS_ERROR_DUPLICATE_TRANSACTION: "Transactions are duplicate",
  RS_ERROR_TRANSACTION_DOES_NOT_EXIST: "Transaction does not exist",
  RS_ERROR_ZERO_DEBIT_AMOUNT: "Zero debit amount",
  RS_ERROR_TRANSACTION_INVALID: "Transaction is not valid",
  RS_ERROR_NEGATIVE_AMOUNT: "Amount in input is negative",
  RS_ERROR_TRANSACTION_TIMEOUT: "Timeout happened on transaction",
  RS_PENDING: "Pending settlement",
  RS_PARTIAL: "Partial Settlement",
  RS_FAILED: "Failed Settlement",
};

module.exports = STATUS_CODES;
