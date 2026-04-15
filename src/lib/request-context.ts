import { NextRequest } from "next/server";
import { logger, Logger } from "./logger";

/**
 * Per-request context. The caller resolves it once at the top of each
 * route and passes the `log` down — explicit is cheaper to reason about at
 * this scale than AsyncLocalStorage, and avoids an experimental runtime
 * dependency on Vercel.
 */
export interface RequestContext {
  requestId: string;
  route: string;
  log: Logger;
}

const REQUEST_ID_HEADER = "x-request-id";

/**
 * Short, sortable id. Shape matches the Araviel frontend/API so the same
 * id flows from browser → araviel-api → ade.
 */
export function generateRequestId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

export function requestContext(
  request: NextRequest,
  route: string
): RequestContext {
  const headerValue = request.headers.get(REQUEST_ID_HEADER);
  const requestId =
    headerValue && headerValue.length > 0 && headerValue.length <= 128
      ? headerValue
      : generateRequestId();
  return {
    requestId,
    route,
    log: logger.child({ requestId, route }),
  };
}

/** Merge the request id into a response headers record. */
export function withRequestId(
  headers: Record<string, string> = {},
  requestId: string
): Record<string, string> {
  return { ...headers, "X-Request-Id": requestId };
}
