import { Router } from "express";
import { db } from "@workspace/db";
import { problemsTable, solutionsTable } from "@workspace/db";
import { getTelemetry } from "../lib/telemetry";
import { currentTick } from "../lib/lamport";
import { getPublicKey } from "../lib/signing";
import { getAggregatedOps, getWorkerStatus, getPhysicalNodeCount } from "../lib/workers";
import { executeSecure } from "../lib/vault";

const router = Router();

router.get("/telemetry", async (req, res) => {
  const t = getTelemetry();
  const tick = currentTick();
  const workerOps = getAggregatedOps();

  // Real homeostasis: solution-to-paradox resolution ratio from live DB
  let homeostasis = "0.00";
  try {
    const paradoxes = await db.select().from(problemsTable);
    const resolved = await db.select().from(solutionsTable);
    const p = paradoxes.length || 1;
    const s = resolved.length;
    homeostasis = Math.min((s / p) * 100, 100).toFixed(2);
  } catch {
    // DB unavailable — keep sentinel value
  }

  const secured = await executeSecure("telemetry.read", { tick });

  res.json({
    systemId: "SOLVEX-CORE-03",
    mode: t.systemStatic ? "SYSTEM-STATIC" : "SOVEREIGN OPERATING MODE",
    homeostasis,
    opsPerSec: workerOps,
    heapUsedMB: t.heapUsedMB,
    heapTotalMB: t.heapTotalMB,
    eventLoopLagMs: t.eventLoopLagMs,
    uptimeSec: t.uptimeSec,
    rssMB: t.rssMB,
    systemStatic: t.systemStatic,
    lamportTick: tick,
    physicalNodes: getPhysicalNodeCount(),
    logicalNodes: 54,
    workerStatus: getWorkerStatus(),
    signature: secured.signature,
    digest: secured.digest,
    nonce: secured.nonce,
    timestamp: secured.timestamp,
    publicKey: getPublicKey(),
  });
});

export default router;
