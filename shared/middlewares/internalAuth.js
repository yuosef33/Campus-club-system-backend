const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const requireInternalServiceKey = (req, res, next) => {
  const configuredKey = process.env.SERVICE_AUTH_KEY;
  if (!configuredKey) {
    return next();
  }

  const incomingKey = req.headers["x-service-key"];
  if (!incomingKey || incomingKey !== configuredKey) {
    logger.security("Invalid internal service key", {
      request: logger.getRequestMeta(req),
    });
    return next(new ApiError(401, "Unauthorized internal service request."));
  }

  return next();
};

module.exports = {
  requireInternalServiceKey,
};
