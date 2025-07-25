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

const updateOperator = async ({ id, operator_id, environment, callback_url }) => {
  // Basic validation
  if (!operator_id || !environment || !callback_url) {
    return {
      success: false,
      message: "All fields are required.",
      status: 400,
    };
  }

  // Check if operator_id exists in other records
  const existing = await OperatorModal.findByOperatorId(operator_id);

  // Proceed to update
  const result = await OperatorModal.updateOperator({ id, operator_id, environment, callback_url });

  return {
    success: true,
    ...result, // assuming updateOperator returns updated row info or at least id
  };
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

const fetchOperatorsList = async () => {
  const result = await OperatorModal.getOperatorsList();
  return result;
};
module.exports = {
  fetchOperators,addOperator,
  getById,
  deleteOperatorById,
  updateOperator,
  updateOperatorStatus,
  getStatusByOperatorId,
  fetchOperatorsList
};
