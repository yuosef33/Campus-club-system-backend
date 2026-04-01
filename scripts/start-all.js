const { spawn } = require("child_process");
const path = require("path");

const services = [
  { name: "auth-service", script: "services/auth-service/src/server.js" },
  { name: "event-service", script: "services/event-service/src/server.js" },
  { name: "rsvp-service", script: "services/rsvp-service/src/server.js" },
  {
    name: "announcement-service",
    script: "services/announcement-service/src/server.js",
  },
  { name: "gallery-service", script: "services/gallery-service/src/server.js" },
  { name: "api-gateway", script: "api-gateway/src/server.js" },
];

const childProcesses = [];
let shuttingDown = false;

const stopAll = (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 500);
};

for (const service of services) {
  const child = spawn(process.execPath, [path.resolve(service.script)], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code) => {
    if (shuttingDown) return;
    if (code !== 0) {
      console.error(`[start-all] ${service.name} exited with code ${code}`);
      stopAll(code || 1);
    }
  });

  child.on("error", (error) => {
    if (shuttingDown) return;
    console.error(`[start-all] failed to start ${service.name}: ${error.message}`);
    stopAll(1);
  });

  childProcesses.push(child);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
