const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data && { data }),
  });
};

// ✅ 200 OK
const success = (res, message = "Success", data = null) =>
  sendResponse(res, 200, true, message, data);
const ok = (res, message = "Success", data = null) =>
  sendResponse(res, 200, true, message, data);

// ✅ 400 Bad Request
const badRequest = (res, message = "Bad Request") =>
  sendResponse(res, 400, false, message);

// ✅ 404 Not Found
const notFound = (res, message = "Not Found") =>
  sendResponse(res, 404, false, message);

// ✅ 500 Internal Server Error
const serverError = (res, message = "Internal Server Error") =>
  sendResponse(res, 500, false, message);

module.exports = {
  success,
  badRequest,
  notFound,
  serverError,
  ok
};
