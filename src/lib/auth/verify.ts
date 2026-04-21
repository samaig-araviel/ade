import { jwtVerify, errors as joseErrors } from "jose";
import { getAdeAuthKeys } from "./keys";
import { AdeAuthError } from "./types";

/**
 * Verifies that an incoming request came from araviel-api.
 *
 * Two layers, in order:
 *   1. A static shared secret in the `X-ADE-Caller-Auth` header. Catches
 *      internet noise without running any crypto.
 *   2. An Ed25519-signed JWT in the `Authorization: Bearer` header. The
 *      token must have `iss=araviel-api`, `aud=ade`, a non-expired `exp`,
 *      and a `kid` matching one of our currently-active verify keys.
 *
 * All validation is local — no external calls, no database lookups.
 * Typical cold-start cost is ~1 ms (key import); warm verify is ~0.3 ms.
 */

const AUTHORIZATION_HEADER = "authorization";
const CALLER_AUTH_HEADER = "x-ade-caller-auth";

const EXPECTED_ISSUER = "araviel-api";
const EXPECTED_AUDIENCE = "ade";
const CLOCK_TOLERANCE_SECONDS = 30;

/**
 * Timing-safe string comparison. Avoids leaking the length of the
 * matching prefix through wall-clock side channels when the attacker
 * controls the input.
 */
function constantTimeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function verifyCallerSecret(
  providedSecret: string | null,
  acceptedSecrets: string[]
): void {
  if (!providedSecret) {
    throw new AdeAuthError(
      "Missing caller-auth header",
      "missing_caller_secret"
    );
  }
  const matches = acceptedSecrets.some((secret) =>
    constantTimeStringEqual(providedSecret, secret)
  );
  if (!matches) {
    throw new AdeAuthError(
      "Invalid caller-auth header",
      "invalid_caller_secret"
    );
  }
}

function extractBearerToken(authorizationHeader: string | null): string {
  if (!authorizationHeader) {
    throw new AdeAuthError(
      "Missing Authorization header",
      "missing_authorization_header"
    );
  }
  if (!authorizationHeader.toLowerCase().startsWith("bearer ")) {
    throw new AdeAuthError(
      "Authorization header must use the Bearer scheme",
      "malformed_authorization_header"
    );
  }
  const token = authorizationHeader.slice(7).trim();
  if (token.length === 0) {
    throw new AdeAuthError(
      "Empty bearer token",
      "malformed_authorization_header"
    );
  }
  return token;
}

function mapJoseError(err: unknown): AdeAuthError {
  if (err instanceof joseErrors.JWTExpired) {
    return new AdeAuthError("Token expired", "expired_token");
  }
  if (err instanceof joseErrors.JWTClaimValidationFailed) {
    if (err.claim === "iss") {
      return new AdeAuthError("Wrong token issuer", "wrong_issuer");
    }
    if (err.claim === "aud") {
      return new AdeAuthError("Wrong token audience", "wrong_audience");
    }
    return new AdeAuthError("Invalid token claim", "invalid_token");
  }
  if (err instanceof joseErrors.JOSEError) {
    return new AdeAuthError("Invalid token", "invalid_token");
  }
  return new AdeAuthError("Invalid token", "invalid_token");
}

/**
 * Verify a request end-to-end. Throws `AdeAuthError` with a precise
 * reason on any failure; returns normally on success.
 */
export async function verifyAdeRequest(request: Request): Promise<void> {
  const keys = await getAdeAuthKeys();

  verifyCallerSecret(
    request.headers.get(CALLER_AUTH_HEADER),
    keys.callerSecrets
  );

  const token = extractBearerToken(request.headers.get(AUTHORIZATION_HEADER));

  try {
    await jwtVerify(
      token,
      async (protectedHeader) => {
        const matchedKey = keys.verifyKeys.find(
          (k) => k.kid === protectedHeader.kid
        );
        if (!matchedKey) {
          throw new AdeAuthError(
            `Unknown key id: ${protectedHeader.kid ?? "(none)"}`,
            "unknown_key_id"
          );
        }
        return matchedKey.publicKey;
      },
      {
        issuer: EXPECTED_ISSUER,
        audience: EXPECTED_AUDIENCE,
        algorithms: ["EdDSA"],
        clockTolerance: CLOCK_TOLERANCE_SECONDS,
      }
    );
  } catch (err) {
    if (err instanceof AdeAuthError) throw err;
    throw mapJoseError(err);
  }
}
