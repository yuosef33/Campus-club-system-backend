require("dotenv").config();
const app = require("./app");
const connectDatabase = require("../../../shared/db/connectDatabase");

const PORT = Number(process.env.EVENT_SERVICE_PORT || 4002);

const start = async () => {
  await connectDatabase("event-service", process.env.EVENT_DB_NAME || "campus_event");

  app.listen(PORT, () => {
    console.log(`[event-service] running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("[event-service] failed to start:", error.message);
  process.exit(1);
});
