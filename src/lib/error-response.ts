import { NextResponse } from "next/server";
import type { Logger } from "./logger";
import type { ErrorResponse } from "@/types";
import { withRequestId } from "./request-context";

/**
 * Extends the existing `errorResponse` helper in `@/lib/errors` with:
 *  - request id propagation in both the body and the `X-Request-Id` header,
 *  - structured logging tied to the per-request logger.
 *
 * New routes prefer this helper. The plain `errorResponse` in `errors.ts`
 * remains available so existing call sites don't have to change all at
 * once; over time they should migrate to this one.
 */

export interface SanitizedErrorBody extends ErrorResponse {
  requestId: string;
}

/**
 * Convert a caught error into a JSON response. `ADEError` instances carry
 * their own `statusCode` and `code`; anything else is reported as a
 * 500 with no stack trace leaked to the client — the full detail goes
 * through the logger instead.
 */
export function respondError(
  err: unknown,
  log: Logger,
  options: { requestId: string }
): NextResponse<SanitizedErrorBody> {
  const { requestId } = options;

  if (isADEError(err)) {
    if (err.statusCode >= 500) {
      log.error("Route error", err);
    } else {
      log.warn("Request rejected", { status: err.statusCode, code: err.code }, err);
    }
    const body: SanitizedErrorBody = {
      error: err.message,
      code: err.code,
      requestId,
      ...(err.details ? { details: err.details } : {}),
    };
    return NextResponse.json(body, {
      status: err.statusCode,
      headers: withRequestId({}, requestId),
    });
  }

  log.error("Unhandled route error", err);
  return NextResponse.json(
    {
      error: "An unexpected error occurred. Please try again.",
      code: "INTERNAL_ERROR",
      requestId,
    },
    {
      status: 500,
      headers: withRequestId({}, requestId),
    }
  );
}

/**
 * Build a JSON response with the request id header attached.
 */
export function respondJson<T extends Record<string, unknown>>(
  body: T,
  options: {
    requestId: string;
    status?: number;
    headers?: Record<string, string>;
  }
): NextResponse<T & { requestId: string }> {
  return NextResponse.json(
    { ...body, requestId: options.requestId },
    {
      status: options.status ?? 200,
      headers: {
        ...withRequestId({}, options.requestId),
        ...(options.headers ?? {}),
      },
    }
  );
}

function isADEError(
  err: unknown
): err is { message: string; code: string; statusCode: number; details?: string } {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    "statusCode" in err &&
    typeof (err as { statusCode?: unknown }).statusCode === "number"
  );
}
