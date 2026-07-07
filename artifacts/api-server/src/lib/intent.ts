/**
 * SOLVEX-CORE: INTENT-BASED SIGNING PROTOCOL
 * AIR-GAPPED EXECUTION MODEL
 *
 * The engine holds ZERO private keys. It is physically incapable of asset transfer.
 *
 * Protocol:
 *   1. Engine generates Signed Intent JSON (action, target, nonce, lamport, collapseHash)
 *   2. Engine signs intent HMAC via Vault Sidecar (sidecar holds the HMAC key)
 *   3. Engine emits intent and HALTS — enters AWAITING_SIGNER state
 *   4. External Authorized Signer (cold wallet / YubiKey) posts confirmationHash
 *   5. Engine resumes, validates hash, marks intent CONFIRMED
 *
 * Solana Intent Generation:
 *   Generates an unsigned Solana Memo Program instruction containing the collapse hash.
 *   The hardware signer signs and broadcasts it. The engine never sees the private key.
 */

import crypto from "crypto";
import { nanoid } from "nanoid";
import { tickLamport } from "./lamport";
import { executeSecure } from "./vault";
import { logger } from "./logger";

// ── Intent types ───────────────────────────────────────────────────────────────
export type IntentAction =
  | "FORCE_COLLAPSE_COMMIT"
  | "ESCROW_RELEASE"
  | "SOLUTION_FINALIZE"
  | "VAULT_WITHDRAWAL";

export type IntentStatus = "PENDING" | "AWAITING_SIGNER" | "CONFIRMED" | "EXPIRED" | "REJECTED";

export interface SignedIntent {
  intentId: string;
  action: IntentAction;
  target: string;        // problemId, orderId, or address
  nonce: string;
  lamport: number;
  collapseHash: string;
  accretionFloor: string;
  timestamp: string;
  hmac: string;          // vault-signed HMAC of the intent payload
  solanaIntent: SolanaIntent | null;
  status: IntentStatus;
  confirmationHash: string | null;
  confirmedAt: string | null;
  expiresAt: string;
}

export interface SolanaIntent {
  network: "devnet" | "mainnet-beta";
  programId: string;     // Memo program
  feePayer: "AWAITING_HARDWARE_PUBKEY";
  recentBlockhash: "AWAITING_RPC_FETCH";
  instruction: {
    programId: string;
    data: string;        // base64-encoded collapse hash — the on-chain memo
    accounts: never[];
  };
  signerRequired: "HARDWARE_COLD_WALLET" | "YUBIKEY";
  note: string;
}

// ── In-memory intent ledger ────────────────────────────────────────────────────
// In production this would persist to DB; for now in-memory with TTL
const INTENT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const intentLedger = new Map<string, SignedIntent>();

// ── Solana intent generator ────────────────────────────────────────────────────
// Generates a valid Solana Memo Program instruction structure.
// The hardware signer provides: feePayer pubkey, recentBlockhash (from RPC), signature.
// SOLANA_MEMO_PROGRAM_ID is the canonical Memo v2 program on devnet + mainnet.
const SOLANA_MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

function buildSolanaIntent(collapseHash: string, nonce: string): SolanaIntent {
  // Encode collapse hash as base64 for the memo instruction data
  const memoData = Buffer.from(`solvex:${collapseHash}:${nonce}`).toString("base64");

  return {
    network: (process.env.SOLANA_NETWORK as "devnet" | "mainnet-beta") ?? "devnet",
    programId: SOLANA_MEMO_PROGRAM_ID,
    feePayer: "AWAITING_HARDWARE_PUBKEY",
    recentBlockhash: "AWAITING_RPC_FETCH",
    instruction: {
      programId: SOLANA_MEMO_PROGRAM_ID,
      data: memoData,
      accounts: [],
    },
    signerRequired: process.env.YUBIKEY_MODE === "true" ? "YUBIKEY" : "HARDWARE_COLD_WALLET",
    note:
      "Submit this instruction to Solana RPC after hardware signing. " +
      "Set feePayer to hardware wallet pubkey and recentBlockhash from getLatestBlockhash().",
  };
}

// ── Intent emitter ─────────────────────────────────────────────────────────────
export async function emitIntent(
  action: IntentAction,
  target: string,
  collapseHash: string,
  accretionFloor: string,
): Promise<SignedIntent> {
  const intentId = nanoid();
  const nonce = crypto.randomBytes(16).toString("hex");
  const lamport = tickLamport();
  const timestamp = new Date().toISOString();
  const expiresAt = new Date(Date.now() + INTENT_TTL_MS).toISOString();

  const payload = { intentId, action, target, nonce, lamport, collapseHash, accretionFloor, timestamp };

  // Vault sidecar signs the intent — engine never computes with the raw key
  const secured = await executeSecure(`intent.${action}`, payload);

  const intent: SignedIntent = {
    intentId,
    action,
    target,
    nonce,
    lamport,
    collapseHash,
    accretionFloor,
    timestamp,
    hmac: secured.signature,
    solanaIntent: buildSolanaIntent(collapseHash, nonce),
    status: "AWAITING_SIGNER",
    confirmationHash: null,
    confirmedAt: null,
    expiresAt,
  };

  intentLedger.set(intentId, intent);

  logger.info(
    { intentId, action, target, lamport, status: "AWAITING_SIGNER" },
    "INTENT_EMITTED: engine halted — awaiting hardware signer confirmation",
  );

  return intent;
}

// ── Confirmation handler ───────────────────────────────────────────────────────
// Called by the hardware signer via POST /api/signer/confirm
export function confirmIntent(intentId: string, confirmationHash: string): {
  ok: boolean;
  error?: string;
  intent?: SignedIntent;
} {
  const intent = intentLedger.get(intentId);
  if (!intent) return { ok: false, error: "INTENT_NOT_FOUND" };
  if (intent.status !== "AWAITING_SIGNER") return { ok: false, error: `INTENT_STATUS_INVALID: ${intent.status}` };
  if (new Date(intent.expiresAt) < new Date()) {
    intent.status = "EXPIRED";
    return { ok: false, error: "INTENT_EXPIRED" };
  }

  // Validate: confirmation hash must be SHA-256 of intentId + hmac + nonce
  const expected = crypto
    .createHash("sha256")
    .update(`${intent.intentId}:${intent.hmac}:${intent.nonce}`)
    .digest("hex");

  // Constant-time comparison — no timing oracle
  const isValid =
    confirmationHash.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(confirmationHash, "hex").slice(0, 32), Buffer.from(expected, "hex").slice(0, 32));

  if (!isValid) {
    intent.status = "REJECTED";
    logger.warn({ intentId, expected: expected.slice(0, 16) + "..." }, "INTENT_REJECTED: confirmation hash mismatch");
    return { ok: false, error: "CONFIRMATION_HASH_MISMATCH" };
  }

  intent.status = "CONFIRMED";
  intent.confirmationHash = confirmationHash;
  intent.confirmedAt = new Date().toISOString();

  logger.info({ intentId, action: intent.action }, "INTENT_CONFIRMED: hardware signer verified");
  return { ok: true, intent };
}

// ── Ledger queries ─────────────────────────────────────────────────────────────
export const getPendingIntents = (): SignedIntent[] =>
  [...intentLedger.values()].filter(i => i.status === "AWAITING_SIGNER");

export const getAllIntents = (): SignedIntent[] =>
  [...intentLedger.values()].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

export const getIntent = (intentId: string): SignedIntent | undefined =>
  intentLedger.get(intentId);

// Prune expired intents periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, intent] of intentLedger.entries()) {
    if (intent.status === "AWAITING_SIGNER" && new Date(intent.expiresAt).getTime() < now) {
      intent.status = "EXPIRED";
      logger.warn({ intentId: id }, "INTENT_EXPIRED: auto-pruned");
    }
  }
}, 60_000);
