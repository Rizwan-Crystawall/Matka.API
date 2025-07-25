const operatorService = require("../services/operatorService");

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

    if (!result.success) {
      return res.status(result.status || 400).json({
        message: result.message,
        data: result,
      });
    }

    res.status(201).json({
      success: true,
      status:201,
      message: "Operator added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding operator:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Server error" });
  }
};


const updateOperator = async (req, res) => {
  try {
    const data = { ...req.body, id: req.params.id };

    const updatedOperator = await operatorService.updateOperator(data);

    if (updatedOperator.success === false) {
      // Conflict or validation error
      return res.status(updatedOperator.status || 400).json({
        message: updatedOperator.message,
        data: updatedOperator,
      });
    }

    res.status(200).json({
      message: "Operator updated successfully",
      data: updatedOperator,
    });
  } catch (error) {
    console.error("Update operator error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getOperatorById = async (req, res) => {
  try {
    const { id } = req.params;

    const operator = await operatorService.getById(id);

    if (!operator) {
      return res
        .status(404)
        .json({ success: false, message: "Operator not found" });
    }

    res.status(200).json({ success: true, data: operator });
  } catch (error) {
    console.error("Error fetching operator by ID:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteOperator = async (req, res) => {
  try {
    const id = req.params.id;
    await operatorService.deleteOperatorById(id);
    res.status(200).json({
      success: true,
      message: "Market deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting market:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const updated = await operatorService.updateOperatorStatus({ status, id });
    res.json({
      message: "Operator updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStatusByOperatorId = async (req, res) => {
  try {
    const updated = await operatorService.getStatusByOperatorId(req.params.id);

    res.json({
      message: "Operator fetch successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getOperatorList = async (req, res) => {
  try {
    // console.log("GET OPERATORS");return;

    const operatorsList = await operatorService.fetchOperatorsList();
    res.status(200).json({
      success: true,
      data: operatorsList,
    });
  } catch (error) {
    console.error("Error in getOperatorList:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch operator list",
    });
  }
};

module.exports = {
  getOperators,
  addOperators,
  updateOperator,
  getOperatorById,
  deleteOperator,
  updateStatus,
  getStatusByOperatorId,
  getOperatorList,
};
