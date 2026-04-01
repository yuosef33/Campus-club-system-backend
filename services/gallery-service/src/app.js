const createServiceApp = require("../../../shared/utils/createServiceApp");
const galleryRoutes = require("./routes/gallery.routes");

const app = createServiceApp("gallery-service", galleryRoutes);

module.exports = app;
