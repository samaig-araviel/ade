import { NextRequest } from 'next/server';
import { analyzeOnly } from '@/core';
import { AnalyzeRequest, Modality } from '@/types';
import { badRequest, invalidField } from '@/lib/errors';
import { requestContext } from '@/lib/request-context';
import { respondError, respondJson } from '@/lib/error-response';

// Valid modalities
const VALID_MODALITIES = new Set(['text', 'code', 'image', 'video', 'voice', 'document', 'text+image', 'text+voice', 'text+code', 'text+video']);

// Validate analyze request
function validateRequest(body: unknown): AnalyzeRequest | { error: string; field?: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object' };
  }

  const request = body as Record<string, unknown>;

  // Check required fields
  if (!request.prompt || typeof request.prompt !== 'string') {
    return { error: 'Missing or invalid prompt', field: 'prompt' };
  }

  if (request.prompt.trim().length === 0) {
    return { error: 'Prompt cannot be empty', field: 'prompt' };
  }

  // Modality is optional, defaults to 'text'
  const modalityValue = request.modality ? String(request.modality).toLowerCase() : 'text';

  if (!VALID_MODALITIES.has(modalityValue)) {
    return {
      error: `Invalid modality. Must be one of: ${Array.from(VALID_MODALITIES).join(', ')}`,
      field: 'modality',
    };
  }

  return {
    prompt: request.prompt,
    modality: modalityValue as Modality,
  };
}

export async function POST(request: NextRequest) {
  const ctx = requestContext(request, 'analyze');
  try {
    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      ctx.log.warn('Invalid JSON in request body');
      return badRequest('Invalid JSON in request body');
    }

    // Validate request
    const validation = validateRequest(body);
    if ('error' in validation) {
      ctx.log.warn('Analyze validation failed', {
        field: validation.field,
        reason: validation.error,
      });
      if (validation.field) {
        return invalidField(validation.field, validation.error);
      }
      return badRequest(validation.error);
    }

    // Execute analysis
    const response = analyzeOnly(validation.prompt, validation.modality);

    return respondJson(response as unknown as Record<string, unknown>, {
      requestId: ctx.requestId,
    });
  } catch (error) {
    return respondError(error, ctx.log, { requestId: ctx.requestId });
  }
}
