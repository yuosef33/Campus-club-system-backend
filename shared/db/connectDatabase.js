const mongoose = require("mongoose");

const connectDatabase = async (serviceName, fallbackDbName) => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI or MONGO_URL environment variable.");
  }

  const dbName = process.env.MONGO_DB_NAME || fallbackDbName;

  await mongoose.connect(mongoUri, { dbName });
  console.log(`[${serviceName}] MongoDB connected (db: ${dbName}).`);
};

module.exports = connectDatabase;
