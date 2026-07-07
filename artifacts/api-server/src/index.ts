import app from "./app";
import { logger } from "./lib/logger";
import { startHeartbeat } from "./lib/heartbeat";
import { initializeWorkerPool } from "./lib/workers";
import { initVaultSidecar } from "./lib/vault";
import { runKineticCore } from "./lib/kinetic";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORTValue: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Pillar 5: Vault sidecar first — forks child process, then erases secrets from main env
  // DB pool already holds its connection string (established at import time), so deletion is safe
  initVaultSidecar();

  // Pillar 1: 54-node worker grid with consensus
  initializeWorkerPool();

  // Pillar 2: Homeostatic watchdog
  startHeartbeat();

  // Kinetic Resolver: synaptic entropy loop — Force-Collapse armed at threshold 0.85
  runKineticCore();

  logger.info("SOLVEX-CORE-FINALIZED: ACTIVE | Sovereign Operating Mode | 54-Node Grid + Keyless Vault + Kinetic Resolver");
});
