import { NextRequest, NextResponse } from 'next/server';
import { analyzeOnly } from '@/core';
import { AnalyzeRequest, Modality } from '@/types';
import { badRequest, invalidField, internalError } from '@/lib/errors';

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

    // Execute analysis
    const response = analyzeOnly(validation.prompt, validation.modality);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analyze error:', error);
    return internalError('An error occurred while analyzing the prompt');
  }
}
