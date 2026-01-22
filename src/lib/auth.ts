import { NextRequest } from 'next/server';

// Result of authentication check
export interface AuthResult {
  valid: boolean;
  error?: string;
}

// Get valid API keys from environment
function getValidApiKeys(): Set<string> {
  const keysEnv = process.env.ADE_API_KEYS ?? '';
  const keys = keysEnv
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  return new Set(keys);
}

// Extract bearer token from Authorization header
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1] ?? null;
}

// Validate API key from request
export function validateApiKey(request: NextRequest): AuthResult {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return {
      valid: false,
      error: 'Missing Authorization header. Use format: Bearer <api_key>',
    };
  }

  const token = extractBearerToken(authHeader);

  if (!token) {
    return {
      valid: false,
      error: 'Invalid Authorization header format. Use format: Bearer <api_key>',
    };
  }

  const validKeys = getValidApiKeys();

  if (validKeys.size === 0) {
    // No API keys configured - deny all
    return {
      valid: false,
      error: 'No API keys configured on server',
    };
  }

  if (!validKeys.has(token)) {
    return {
      valid: false,
      error: 'Invalid API key',
    };
  }

  return { valid: true };
}

// Check if a path requires authentication
export function requiresAuth(pathname: string): boolean {
  // Health endpoint does not require auth
  if (pathname === '/api/v1/health') {
    return false;
  }

  // All other v1 API endpoints require auth
  return pathname.startsWith('/api/v1/');
}
