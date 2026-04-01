const fs = require("fs");
const path = require("path");

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), "logs");
const ENABLE_FILE_LOGS =
  String(process.env.ENABLE_FILE_LOGS || "true").toLowerCase() !== "false";

const ensureLogDirectory = () => {
  if (!ENABLE_FILE_LOGS) return;
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

const safeJson = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return JSON.stringify({ serializationError: error.message });
  }
};

const getRequestMeta = (req) => ({
  method: req.method,
  path: req.originalUrl || req.url,
  ip: req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
  userAgent: req.headers["user-agent"] || "unknown",
  userId: req.user?.userId || null,
});

const writeLogFile = (fileName, payload) => {
  if (!ENABLE_FILE_LOGS) return;
  ensureLogDirectory();
  const filePath = path.join(LOG_DIR, fileName);
  fs.appendFileSync(filePath, `${safeJson(payload)}\n`, "utf8");
};

const log = (level, message, context = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const line = safeJson(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }

  return payload;
};

const error = (message, context = {}) => {
  const payload = log("error", message, context);
  writeLogFile("errors.log", payload);
};

const security = (message, context = {}) => {
  const payload = log("warn", message, context);
  writeLogFile("security.log", payload);
};

module.exports = {
  error,
  security,
  getRequestMeta,
};
