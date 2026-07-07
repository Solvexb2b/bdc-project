/**
 * SOLVEX-CORE-03: Vault Credential Isolator
 * Single access point for all secrets. No other module reads process.env for secrets.
 * In production this boundary would be enforced by a sidecar HSM/Vault process.
 */
import { signAction, type SignedAction } from "./signing";
import { logger } from "./logger";

const REQUIRED_SECRETS = ["DATABASE_URL", "SESSION_SECRET"] as const;
type SecretKey = (typeof REQUIRED_SECRETS)[number];

const _store: Record<string, string> = {};

for (const key of REQUIRED_SECRETS) {
  const val = process.env[key];
  if (val) {
    _store[key] = val;
  } else {
    logger.warn({ key }, "Vault: secret not set at boot");
  }
}

// The only authorized path to retrieve a secret value.
export const getSecret = (key: SecretKey): string => {
  const val = _store[key];
  if (!val) throw new Error(`SECURE_AUTH_FAILED: Secret '${key}' unavailable in vault`);
  return val;
};

export interface SecureResult extends SignedAction {
  ok: boolean;
  action: string;
}

// Engine instructs — Vault executes.
// All privileged actions are signed before dispatch.
// If the vault store is missing required secrets, enters static-lock mode.
export const executeSecure = async (
  action: string,
  data: unknown,
): Promise<SecureResult> => {
  try {
    const signed = signAction(action, data);
    logger.debug({ action, nonce: signed.nonce }, "Vault: signed action dispatched");
    return { ok: true, action, ...signed };
  } catch (err) {
    logger.error({ action, err }, "Vault: SECURE_AUTH_FAILED — emitting SIG_STATIC_LOCK");
    process.emit("SIGUSR2");
    throw new Error("SECURE_AUTH_FAILED: Vault execution error");
  }
};
