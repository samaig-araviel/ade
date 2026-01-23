import { NextRequest, NextResponse } from 'next/server';
import { analyzeOnly } from '@/core';
import { AnalyzeRequest, Modality } from '@/types';
import { badRequest, invalidField, internalError } from '@/lib/errors';

// Valid modalities
const VALID_MODALITIES = new Set(['text', 'image', 'voice', 'text+image', 'text+voice']);

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

  if (!request.modality || typeof request.modality !== 'string') {
    return { error: 'Missing or invalid modality', field: 'modality' };
  }

  if (!VALID_MODALITIES.has(request.modality.toLowerCase())) {
    return {
      error: `Invalid modality. Must be one of: ${Array.from(VALID_MODALITIES).join(', ')}`,
      field: 'modality',
    };
  }

  return {
    prompt: request.prompt,
    modality: request.modality.toLowerCase() as Modality,
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
