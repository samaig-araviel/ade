import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiKey, requiresAuth } from '@/lib/auth';
import { ErrorResponse } from '@/types';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if this path requires authentication
  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  // Validate API key
  const authResult = validateApiKey(request);

  if (!authResult.valid) {
    const errorBody: ErrorResponse = {
      error: authResult.error ?? 'Unauthorized',
      code: 'UNAUTHORIZED',
    };

    return NextResponse.json(errorBody, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
