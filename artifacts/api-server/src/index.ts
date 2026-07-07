import app from "./app";
import { logger } from "./lib/logger";
import { startHeartbeat } from "./lib/heartbeat";
import { initializeWorkerPool } from "./lib/workers";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  initializeWorkerPool();
  startHeartbeat();
  logger.info("SOLVEX-CORE-03: ACTIVE | Sovereign Operating Mode | Worker Pool + Vault Initialized");
});
