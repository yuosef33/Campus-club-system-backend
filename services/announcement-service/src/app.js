const createServiceApp = require("../../../shared/utils/createServiceApp");
const announcementRoutes = require("./routes/announcement.routes");

const app = createServiceApp("announcement-service", announcementRoutes);

module.exports = app;
