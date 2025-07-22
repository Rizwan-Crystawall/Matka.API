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
if (
  operator_id === undefined || operator_id === '' ||
  environment === undefined || environment === '' ||
  callback_url === undefined || callback_url === ''
) {
   return {
      success: false,
      message: "All fields are required.",
    };
}
  const existing = await OperatorModal.findByOperatorId(operator_id);
  
  if (existing.length > 0) {
    return {
      success: false,
      message: "Operator ID already exists.",
      status: 400,
    };
  }
 

  const newOperator = await OperatorModal.addOperator({
    operator_id,
    environment,
    callback_url,
  });

  return newOperator;
};

const editOperator = async (operatorData) => {
  // You can add validation here if needed

  const updatedOperator = await OperatorModal.updateOperator(operatorData);
  return updatedOperator;
};
const getById = async (id) => {
  return await OperatorModal.getOperatorById(id); // Sequelize
  // return await Operator.findById(id); // Mongoose
};


const deleteOperatorById = async (id) => {  
  if (!id || isNaN(id)) {
    throw new Error("Invalid operator ID.");
  }
  const result =  OperatorModal.deleteOperator(id);
};

const updateOperatorStatus = async ({ status, id }) => {  
  return await OperatorModal.updateOperatorStatus(status, id);
};
const getStatusByOperatorId = async (operatorId) => {   
  return await OperatorModal.getStatusByOperatorId(operatorId);
};


module.exports = {
  fetchOperators,addOperator,
  getById,
  deleteOperatorById,
  editOperator,
  updateOperatorStatus,
  getStatusByOperatorId
};
