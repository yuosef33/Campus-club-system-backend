require("dotenv").config();
const app = require("./app");
const connectDatabase = require("../../../shared/db/connectDatabase");
const authService = require("./services/auth.service");

const PORT = Number(process.env.AUTH_SERVICE_PORT || 4001);

const start = async () => {
  await connectDatabase("auth-service", process.env.AUTH_DB_NAME || "campus_auth");
  await authService.ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`[auth-service] running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("[auth-service] failed to start:", error.message);
  process.exit(1);
});
