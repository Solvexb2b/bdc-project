/**
 * SOLVEX-CORE: HARDWARE SIGNER INTERFACE
 * The authorized hardware signer (cold wallet / YubiKey) communicates via this route.
 *
 * POST /api/signer/confirm  — signer posts confirmation hash, engine resumes
 * GET  /api/signer/pending  — list all intents awaiting signer confirmation
 * GET  /api/signer/intent/:id — inspect a specific intent
 * GET  /api/signer/status   — signer interface health
 */

import { Router } from "express";
import { confirmIntent, getPendingIntents, getAllIntents, getIntent } from "../lib/intent";
import { kernelStatus } from "../lib/heuristic-kernel";
import { getKineticState } from "../lib/kinetic";

const router = Router();

// Hardware signer calls this endpoint after signing the intent
router.post("/signer/confirm", async (req, res) => {
  const { intentId, confirmationHash } = req.body;
  if (!intentId || !confirmationHash) {
    res.status(400).json({ error: "intentId and confirmationHash required" });
    return;
  }
  const result = confirmIntent(intentId, confirmationHash);
  if (!result.ok) {
    res.status(result.error === "INTENT_NOT_FOUND" ? 404 : 422).json({ error: result.error });
    return;
  }
  res.json({ confirmed: true, intent: result.intent });
});

// List pending intents awaiting hardware signer
router.get("/signer/pending", (_req, res) => {
  res.json(getPendingIntents());
});

// Full intent ledger
router.get("/signer/intents", (_req, res) => {
  res.json(getAllIntents());
});

// Inspect specific intent
router.get("/signer/intent/:id", (req, res) => {
  const intent = getIntent(req.params.id);
  if (!intent) { res.status(404).json({ error: "Intent not found" }); return; }
  res.json(intent);
});

// Signer interface status
router.get("/signer/status", (_req, res) => {
  const pending = getPendingIntents();
  const kinetic = getKineticState();
  res.json({
    signerInterface: "AWAITING_HARDWARE_HOOK",
    pendingIntents: pending.length,
    hardwareMode: process.env.YUBIKEY_MODE === "true" ? "YUBIKEY" : "COLD_WALLET",
    solanaNetwork: process.env.SOLANA_NETWORK ?? "devnet",
    solanaKeypair: process.env.SOLANA_KEYPAIR ? "PROVISIONED" : "AWAITING_KEYPAIR",
    kernel: kernelStatus(),
    kinetic: {
      status: kinetic.status,
      entropy: kinetic.entropy,
      collapseCount: kinetic.collapseCount,
    },
  });
});

export default router;
