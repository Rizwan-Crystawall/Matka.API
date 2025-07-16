const operatorService = require('../services/operatorService');

const getOperators = async (req, res) => {
  try {
    const operators = await operatorService.fetchOperators();
    res.status(200).json(operators);
  } catch (error) {
    console.error("Error fetching operators:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addOperators = async (req, res) => {
  try {
    const result = await operatorService.addOperator(req.body);
    res.status(201).json({ message: 'Operator added successfully', data: result });
  } catch (error) {
    console.error('Error adding operator:', error);
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};
const updateOperator = async (req, res) => {
  try {
    const data = { ...req.body, id: req.params.id };  // add id here

    const updatedOperator = await operatorService.editOperator(data);
    res.json({ message: "Operator updated successfully", data: updatedOperator });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
 getOperators,
 addOperators,
 updateOperator
};
