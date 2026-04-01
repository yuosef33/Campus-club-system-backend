const createServiceApp = require("../../../shared/utils/createServiceApp");
const rsvpRoutes = require("./routes/rsvp.routes");

const app = createServiceApp("rsvp-service", rsvpRoutes);

module.exports = app;
