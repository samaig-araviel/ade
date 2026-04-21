import { NextRequest, NextResponse } from "next/server";
import { assertRequiredEnvPresent } from "@/lib/auth/keys";
import { verifyAdeRequest } from "@/lib/auth/verify";
import { AdeAuthError, type AuthFailureReason } from "@/lib/auth/types";
import { authMetrics } from "@/lib/metrics";

/**
 * Edge middleware that gates every `/api/v1/*` endpoint except
 * `/api/v1/health`.
 *
 * Rollout strategy:
 *   - `ADE_AUTH_REQUIRED=false` → auth runs in observe mode. Every
 *     success/failure is counted and logged but requests are never
 *     blocked. Used while araviel-api is being deployed.
 *   - `ADE_AUTH_REQUIRED=true` (or unset) → failures return 401. This
 *     is the steady-state production setting.
 *
 * Fail-closed posture: if the required env vars are absent when auth
 * is enforced, middleware throws at module load so the cold-start
 * invocation fails rather than silently accepting unauthenticated
 * traffic. Observe mode skips this check so a misconfigured ADE
 * deployment can still serve while operators investigate.
 */

assertRequiredEnvPresent();

const PUBLIC_PATHS = new Set<string>(["/api/v1/health"]);

function isAuthEnforced(): boolean {
  return process.env.ADE_AUTH_REQUIRED !== "false";
}

function buildUnauthorizedResponse(
  reason: AuthFailureReason,
  message: string
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code: "UNAUTHORIZED",
      reason,
    },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Bearer error="invalid_token"',
      },
    }
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (PUBLIC_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const enforced = isAuthEnforced();

  try {
    await verifyAdeRequest(request);
    authMetrics.recordSuccess();
    return NextResponse.next();
  } catch (err) {
    const reason: AuthFailureReason =
      err instanceof AdeAuthError ? err.reason : "invalid_token";
    const message =
      err instanceof AdeAuthError ? err.message : "Authentication failed";

    authMetrics.recordFailure(reason);

    if (!enforced) {
      // Observe mode: let the request through but emit a log line so
      // operators can see what real traffic looks like before flipping
      // the flag.
      console.warn(
        JSON.stringify({
          level: "warn",
          msg: "ADE auth observe-mode failure",
          reason,
          path: request.nextUrl.pathname,
        })
      );
      return NextResponse.next();
    }

    console.warn(
      JSON.stringify({
        level: "warn",
        msg: "ADE auth failure",
        reason,
        path: request.nextUrl.pathname,
      })
    );
    return buildUnauthorizedResponse(reason, message);
  }
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
