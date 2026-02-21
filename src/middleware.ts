import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // All endpoints are currently public — no authentication required.
  // Authentication will be re-added once all endpoints are confirmed working.
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
