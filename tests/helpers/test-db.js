const fs = require("node:fs");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let dbUnavailableReason = null;

const DEFAULT_DB_NAME = process.env.TEST_DB_NAME || "campus_club_test";

const isUnsupportedMongoMemoryServerError = (error) => {
  const message = String(error?.message || "");
  return (
    message.includes('Unknown/unsupported linux "alpine"') ||
    message.includes("There is no official build of MongoDB for Alpine")
  );
};

const connectWithUri = async (uri) => {
  await mongoose.connect(uri, { dbName: DEFAULT_DB_NAME });
  return true;
};

const isAlpineRuntime = () => {
  if (process.platform !== "linux") return false;

  try {
    const release = fs.readFileSync("/etc/os-release", "utf8").toLowerCase();
    return release.includes("id=alpine");
  } catch {
    return false;
  }
};

const connectTestDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  dbUnavailableReason = null;

  if (process.env.TEST_MONGO_URI) {
    return connectWithUri(process.env.TEST_MONGO_URI);
  }

  if (isAlpineRuntime()) {
    dbUnavailableReason = new Error(
      "MongoMemoryServer is not supported on Alpine without TEST_MONGO_URI."
    );
    return false;
  }

  try {
    mongoServer = await MongoMemoryServer.create();
    return connectWithUri(mongoServer.getUri());
  } catch (error) {
    dbUnavailableReason = error;
    if (isUnsupportedMongoMemoryServerError(error)) {
      return false;
    }
    throw error;
  }
};

const isDatabaseAvailable = () => mongoose.connection.readyState === 1;

const getDatabaseUnavailableReason = () =>
  dbUnavailableReason
    ? String(dbUnavailableReason.message || dbUnavailableReason)
    : null;

const runIfDatabaseAvailable = (name, testFn, timeout) =>
  test(
    name,
    async () => {
      if (!isDatabaseAvailable()) {
        const reason =
          getDatabaseUnavailableReason() || "Database is not connected.";
        throw new Error(
          `[tests] Functional test requires a database connection. ${reason} Set TEST_MONGO_URI to a reachable MongoDB instance.`
        );
      }
      await testFn();
    },
    timeout
  );

const logSkipIfDatabaseUnavailable = () => {
  const reason = getDatabaseUnavailableReason();
  if (reason) {
    throw new Error(
      `[tests] Functional DB is unavailable: ${reason} Set TEST_MONGO_URI to a reachable MongoDB instance.`
    );
  }
};

const clearTestDatabase = async () => {
  if (!isDatabaseAvailable()) return;

  const collections = mongoose.connection.collections;
  const tasks = Object.keys(collections).map((name) =>
    collections[name].deleteMany({})
  );
  await Promise.all(tasks);
};

const disconnectTestDatabase = async () => {
  try {
    if (isDatabaseAvailable()) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  }
};

module.exports = {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
  isDatabaseAvailable,
  getDatabaseUnavailableReason,
  runIfDatabaseAvailable,
  logSkipIfDatabaseUnavailable,
};
