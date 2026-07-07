import { Router } from "express";
import { getTelemetry } from "../lib/telemetry";
import { currentTick } from "../lib/lamport";
import { getPublicKey, signAction } from "../lib/signing";

const router = Router();

router.get("/telemetry", (req, res) => {
  const t = getTelemetry();
  const tick = currentTick();
  const signed = signAction("telemetry.read", { tick });

  res.json({
    systemId: "SOLVEX-CORE-02",
    mode: t.systemStatic ? "SYSTEM-STATIC" : "SOVEREIGN OPERATING MODE",
    opsPerSec: t.opsPerSec,
    heapUsedMB: t.heapUsedMB,
    heapTotalMB: t.heapTotalMB,
    eventLoopLagMs: t.eventLoopLagMs,
    uptimeSec: t.uptimeSec,
    rssMB: t.rssMB,
    externalMB: t.externalMB,
    systemStatic: t.systemStatic,
    lamportTick: tick,
    signature: signed.signature,
    digest: signed.digest,
    nonce: signed.nonce,
    timestamp: signed.timestamp,
    publicKey: getPublicKey(),
  });
});

export default router;
