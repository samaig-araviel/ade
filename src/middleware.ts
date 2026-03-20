import { NextResponse, type NextRequest } from 'next/server';
import { validateApiKey, requiresAuth } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for paths that don't require it (health, models, public endpoints in dev)
  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  // Validate API key for protected endpoints
  const authResult = validateApiKey(request);

  if (!authResult.valid) {
    return NextResponse.json(
      { error: authResult.error },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
