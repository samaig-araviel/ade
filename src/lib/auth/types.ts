/**
 * Types shared across the ADE auth module.
 *
 * Kept separate from `verify.ts` so the types can be imported without
 * pulling in `jose` or the key-loading side effects.
 */

/**
 * Fine-grained reasons for rejecting a request. Used in both metrics
 * counters (for alerting on spikes) and log lines (for diagnosing
 * misconfiguration or attack patterns).
 */
export type AuthFailureReason =
  | "missing_caller_secret"
  | "invalid_caller_secret"
  | "missing_authorization_header"
  | "malformed_authorization_header"
  | "invalid_token"
  | "expired_token"
  | "wrong_issuer"
  | "wrong_audience"
  | "unknown_key_id"
  | "config_error";

/**
 * Typed error thrown by the verify pipeline. Carries a stable machine
 * reason and a safe-to-return human message.
 */
export class AdeAuthError extends Error {
  constructor(
    message: string,
    public readonly reason: AuthFailureReason
  ) {
    super(message);
    this.name = "AdeAuthError";
  }
}
