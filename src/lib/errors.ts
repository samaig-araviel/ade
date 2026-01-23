import { NextResponse } from 'next/server';
import { ErrorResponse } from '@/types';

// Custom error class for ADE errors
export class ADEError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ADEError';
  }
}

// Common error codes
export const ErrorCodes = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FIELD: 'INVALID_FIELD',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NO_MODELS_AVAILABLE: 'NO_MODELS_AVAILABLE',
} as const;

// Create error response
export function errorResponse(
  message: string,
  code: string,
  statusCode: number,
  details?: string
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = {
    error: message,
    code,
    ...(details && { details }),
  };

  return NextResponse.json(body, { status: statusCode });
}

// Specific error responses
export function badRequest(message: string, details?: string): NextResponse<ErrorResponse> {
  return errorResponse(message, ErrorCodes.INVALID_REQUEST, 400, details);
}

export function missingField(field: string): NextResponse<ErrorResponse> {
  return errorResponse(
    `Missing required field: ${field}`,
    ErrorCodes.MISSING_FIELD,
    400
  );
}

export function invalidField(field: string, reason: string): NextResponse<ErrorResponse> {
  return errorResponse(
    `Invalid field: ${field}`,
    ErrorCodes.INVALID_FIELD,
    400,
    reason
  );
}

export function unauthorized(message: string): NextResponse<ErrorResponse> {
  return errorResponse(message, ErrorCodes.UNAUTHORIZED, 401);
}

export function notFound(resource: string): NextResponse<ErrorResponse> {
  return errorResponse(
    `${resource} not found`,
    ErrorCodes.NOT_FOUND,
    404
  );
}

export function internalError(message: string): NextResponse<ErrorResponse> {
  return errorResponse(message, ErrorCodes.INTERNAL_ERROR, 500);
}
