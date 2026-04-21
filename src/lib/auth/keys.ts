import { importSPKI, type CryptoKey } from "jose";
import { AdeAuthError } from "./types";

/**
 * Loads and caches the Ed25519 public keys and Layer 0 shared secrets
 * that ADE uses to authenticate incoming requests from araviel-api.
 *
 * Two active keys are supported at any time (`CURRENT` and `PREVIOUS`)
 * so that araviel-api can roll to a new signing key without a flag-day
 * coordination. Tokens signed by either key verify cleanly until the
 * old one is removed.
 *
 * All parsing happens once, lazily on first request, and is cached for
 * the lifetime of the process. Cold-start cost is ~1-2 ms; subsequent
 * requests are pure lookup.
 */

export interface VerifyKey {
  kid: string;
  publicKey: CryptoKey;
}

export interface AdeAuthKeys {
  verifyKeys: VerifyKey[];
  callerSecrets: string[];
}

const REQUIRED_ENV_VARS = [
  "ADE_JWT_PUBLIC_KEY_CURRENT",
  "ADE_JWT_KID_CURRENT",
  "ADE_CALLER_SECRET_CURRENT",
] as const;

let keysPromise: Promise<AdeAuthKeys> | null = null;

function decodeBase64ToUtf8(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}

async function importPublicKey(base64Pem: string): Promise<CryptoKey> {
  const pem = decodeBase64ToUtf8(base64Pem);
  return importSPKI(pem, "EdDSA");
}

/**
 * Read required env vars synchronously at module load so misconfiguration
 * is visible on cold start rather than at first request. Throws an
 * AdeAuthError with reason "config_error" if anything required is
 * missing when auth is enforced.
 */
export function assertRequiredEnvPresent(): void {
  if (process.env.ADE_AUTH_REQUIRED === "false") return;
  for (const name of REQUIRED_ENV_VARS) {
    const value = process.env[name];
    if (!value || value.length === 0) {
      throw new AdeAuthError(
        `Missing required env var: ${name}`,
        "config_error"
      );
    }
  }
}

async function loadKeys(): Promise<AdeAuthKeys> {
  const currentBase64 = process.env.ADE_JWT_PUBLIC_KEY_CURRENT;
  const currentKid = process.env.ADE_JWT_KID_CURRENT;
  const currentCallerSecret = process.env.ADE_CALLER_SECRET_CURRENT;

  if (!currentBase64 || !currentKid || !currentCallerSecret) {
    throw new AdeAuthError(
      "ADE auth env vars missing at key load",
      "config_error"
    );
  }

  const verifyKeys: VerifyKey[] = [];
  const callerSecrets: string[] = [currentCallerSecret];

  try {
    verifyKeys.push({
      kid: currentKid,
      publicKey: await importPublicKey(currentBase64),
    });
  } catch {
    throw new AdeAuthError(
      "ADE_JWT_PUBLIC_KEY_CURRENT is not a valid base64-encoded Ed25519 SPKI PEM",
      "config_error"
    );
  }

  const previousBase64 = process.env.ADE_JWT_PUBLIC_KEY_PREVIOUS;
  const previousKid = process.env.ADE_JWT_KID_PREVIOUS;
  const previousCallerSecret = process.env.ADE_CALLER_SECRET_PREVIOUS;

  if (previousBase64 && previousKid) {
    try {
      verifyKeys.push({
        kid: previousKid,
        publicKey: await importPublicKey(previousBase64),
      });
    } catch {
      throw new AdeAuthError(
        "ADE_JWT_PUBLIC_KEY_PREVIOUS is not a valid base64-encoded Ed25519 SPKI PEM",
        "config_error"
      );
    }
  }

  if (previousCallerSecret) {
    callerSecrets.push(previousCallerSecret);
  }

  return { verifyKeys, callerSecrets };
}

export function getAdeAuthKeys(): Promise<AdeAuthKeys> {
  if (!keysPromise) {
    keysPromise = loadKeys().catch((err) => {
      keysPromise = null;
      throw err;
    });
  }
  return keysPromise;
}

/**
 * Test-only helper. Resets cached keys so tests can swap env vars
 * between cases. Never call from production code.
 */
export function __resetAdeAuthKeysForTests(): void {
  keysPromise = null;
}
