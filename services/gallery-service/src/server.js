require("dotenv").config();
const app = require("./app");
const connectDatabase = require("../../../shared/db/connectDatabase");

const PORT = Number(process.env.GALLERY_SERVICE_PORT || 4005);

const start = async () => {
  await connectDatabase("gallery-service", process.env.GALLERY_DB_NAME || "campus_gallery");

  app.listen(PORT, () => {
    console.log(`[gallery-service] running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("[gallery-service] failed to start:", error.message);
  process.exit(1);
});
