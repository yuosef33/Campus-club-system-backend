const createServiceApp = require("../../../shared/utils/createServiceApp");
const authRoutes = require("./routes/auth.routes");

const app = createServiceApp("auth-service", authRoutes);

module.exports = app;
