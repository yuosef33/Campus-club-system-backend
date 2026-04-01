const createServiceApp = require("../../../shared/utils/createServiceApp");
const eventRoutes = require("./routes/event.routes");

const app = createServiceApp("event-service", eventRoutes);

module.exports = app;
