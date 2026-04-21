import { NextRequest, NextResponse } from "next/server";
import { authMetrics, routingMetrics } from "@/lib/metrics";
import { requestContext, withRequestId } from "@/lib/request-context";

// Version from package.json or default
const VERSION = process.env.npm_package_version ?? "1.0.0";

/**
 * Health probe + lightweight metrics snapshot.
 *
 * The endpoint is deliberately cheap: it returns process-local counters
 * and a rolling latency window so operators can confirm the engine is up
 * and responsive without any external dependencies (no DB ping, no KV
 * round-trip). Persistent metrics belong in a real time-series store.
 */
export async function GET(request: NextRequest) {
  const ctx = requestContext(request, "health");
  const metrics = routingMetrics.snapshot();
  const auth = authMetrics.snapshot();
  const response = {
    status: "healthy" as const,
    timestamp: new Date().toISOString(),
    version: VERSION,
    services: {
      engine: "ready" as const,
      store: "in-memory" as const,
    },
    metrics,
    auth,
    requestId: ctx.requestId,
  };

  return NextResponse.json(response, {
    headers: withRequestId({}, ctx.requestId),
  });
}
