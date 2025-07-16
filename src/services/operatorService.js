const OperatorModal = require("../modal/OperatorModal");

const fetchOperators = async () => {
  const operators = await OperatorModal.getOperators();
  if (!operators || operators.length === 0) {
    return {
      success: false,
      message: "No operators found",
    };
  }
  return {
    success: true,
    data: operators,
  };
};

const addOperator = async ({ operator_id, environment, callback_url,status }) => {
  if (!operator_id || !environment || !callback_url || !status) {
    const error = new Error("All fields (operator_id, environment, callback_url,status) are required.");
    error.status = 400;
    throw error;
  }

  const newOperator = await OperatorModal.addOperator({
    operator_id,
    environment,
    callback_url,
    status,
  });

  return newOperator;
};

const editOperator = async (operatorData) => {
  // You can add validation here if needed

  const updatedOperator = await OperatorModal.updateOperator(operatorData);
  return updatedOperator;
};
module.exports = {
  fetchOperators,addOperator,
  editOperator
};
