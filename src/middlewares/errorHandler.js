const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  if (err?.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      err = new ApiError(400, "Image size must be 10 MB or less.");
    } else {
      err = new ApiError(400, err.message || "Invalid file upload.");
    }
  }

  const statusCode =
    err instanceof ApiError && err.statusCode ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  const requestMeta = logger.getRequestMeta(req);
  logger.error("Unhandled request error", {
    statusCode,
    request: requestMeta,
    details: err.details || null,
    stack: err.stack,
  });

  if (statusCode === 401 || statusCode === 403) {
    logger.security("Security-related request failure", {
      statusCode,
      request: requestMeta,
      reason: message,
    });
  }

  const response = {
    success: false,
    message,
  };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
