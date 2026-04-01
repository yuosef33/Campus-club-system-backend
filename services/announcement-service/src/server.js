require("dotenv").config();
const app = require("./app");
const connectDatabase = require("../../../shared/db/connectDatabase");

const PORT = Number(process.env.ANNOUNCEMENT_SERVICE_PORT || 4004);

const start = async () => {
  await connectDatabase(
    "announcement-service",
    process.env.ANNOUNCEMENT_DB_NAME || "campus_announcement"
  );

  app.listen(PORT, () => {
    console.log(`[announcement-service] running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("[announcement-service] failed to start:", error.message);
  process.exit(1);
});
