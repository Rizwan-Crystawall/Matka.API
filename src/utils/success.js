const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    message,
    ...data
  });
};

module.exports = {
  successResponse,
};
