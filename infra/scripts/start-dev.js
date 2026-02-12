const { execSync, spawn } = require("node:child_process");

let isStopping = false;

startServices();

process.on("SIGINT", () => stopServices());
process.on("SIGTERM", () => stopServices());

function stopServices() {
  if (isStopping) return;
  isStopping = true;

  execSync("npm run services:stop", { stdio: "inherit" });
  console.log("All services stopped.");
}

function startServices() {
  console.info("Starting services...");
  execSync("npm run services:up");
  execSync("npm run services:wait:database");
  execSync("npm run migrations:up");
  spawn("node", ["node_modules/next/dist/bin/next", "dev"], {
    stdio: "inherit",
  });
}
