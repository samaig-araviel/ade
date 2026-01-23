import { NextRequest, NextResponse } from 'next/server';
import { FeedbackRequest, FeedbackResponse, FeedbackSignal } from '@/types';
import { badRequest, invalidField, notFound, internalError } from '@/lib/errors';
import { addFeedback, getDecision } from '@/lib/kv';

// Valid feedback signals
const VALID_SIGNALS = new Set(['positive', 'neutral', 'negative']);

// Validate feedback request
function validateRequest(body: unknown): FeedbackRequest | { error: string; field?: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object' };
  }

  const request = body as Record<string, unknown>;

  // Check required fields
  if (!request.decisionId || typeof request.decisionId !== 'string') {
    return { error: 'Missing or invalid decisionId', field: 'decisionId' };
  }

  if (!request.signal || typeof request.signal !== 'string') {
    return { error: 'Missing or invalid signal', field: 'signal' };
  }

  if (!VALID_SIGNALS.has(request.signal.toLowerCase())) {
    return {
      error: `Invalid signal. Must be one of: ${Array.from(VALID_SIGNALS).join(', ')}`,
      field: 'signal',
    };
  }

  const validated: FeedbackRequest = {
    decisionId: request.decisionId,
    signal: request.signal.toLowerCase() as FeedbackSignal,
  };

  // Optional comment
  if (request.comment !== undefined) {
    if (typeof request.comment !== 'string') {
      return { error: 'Comment must be a string', field: 'comment' };
    }
    validated.comment = request.comment;
  }

  return validated;
}

export async function POST(request: NextRequest) {
  try {
    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Invalid JSON in request body');
    }

    // Validate request
    const validation = validateRequest(body);
    if ('error' in validation) {
      if (validation.field) {
        return invalidField(validation.field, validation.error);
      }
      return badRequest(validation.error);
    }

    // Check if decision exists
    const decision = await getDecision(validation.decisionId);
    if (!decision) {
      return notFound(`Decision ${validation.decisionId}`);
    }

    // Add feedback
    const success = await addFeedback(
      validation.decisionId,
      validation.signal,
      validation.comment
    );

    if (!success) {
      return internalError('Failed to store feedback');
    }

    const response: FeedbackResponse = {
      success: true,
      decisionId: validation.decisionId,
      message: 'Feedback recorded successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Feedback error:', error);
    return internalError('An error occurred while storing feedback');
  }
}
