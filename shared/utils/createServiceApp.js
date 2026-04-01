const express = require("express");
const cors = require("cors");
const notFound = require("../middlewares/notFound");
const errorHandler = require("../middlewares/errorHandler");

const createServiceApp = (serviceName, rootRouter) => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (req, res) => {
    res.json({
      success: true,
      service: serviceName,
      timestamp: new Date().toISOString(),
    });
  });

  app.use(rootRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createServiceApp;
