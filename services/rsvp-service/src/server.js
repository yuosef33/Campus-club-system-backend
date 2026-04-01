require("dotenv").config();
const app = require("./app");
const connectDatabase = require("../../../shared/db/connectDatabase");

const PORT = Number(process.env.RSVP_SERVICE_PORT || 4003);

const start = async () => {
  await connectDatabase("rsvp-service", process.env.RSVP_DB_NAME || "campus_rsvp");

  app.listen(PORT, () => {
    console.log(`[rsvp-service] running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("[rsvp-service] failed to start:", error.message);
  process.exit(1);
});
