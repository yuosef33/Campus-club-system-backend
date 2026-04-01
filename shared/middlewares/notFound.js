const logger = require("../utils/logger");

const notFound = (req, res) => {
  logger.security("Route probing or unknown endpoint access", {
    request: logger.getRequestMeta(req),
  });

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
