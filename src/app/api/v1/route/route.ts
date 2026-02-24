import { NextRequest, NextResponse } from 'next/server';
import { route } from '@/core';
import { RouteRequest, Modality, AccessTier, Provider } from '@/types';
import { badRequest, invalidField, internalError } from '@/lib/errors';
import { storeDecision } from '@/lib/kv';

// Valid modalities
const VALID_MODALITIES = new Set(['text', 'image', 'voice', 'text+image', 'text+voice']);

// Validate route request
function validateRequest(body: unknown): RouteRequest | { error: string; field?: string } {
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

  // Build validated request
  const validated: RouteRequest = {
    prompt: request.prompt,
    modality: request.modality.toLowerCase() as Modality,
  };

  // Optional context
  if (request.context !== undefined) {
    if (typeof request.context !== 'object' || request.context === null) {
      return { error: 'Context must be an object', field: 'context' };
    }
    validated.context = request.context as RouteRequest['context'];
  }

  // Optional humanContext
  if (request.humanContext !== undefined) {
    if (typeof request.humanContext !== 'object' || request.humanContext === null) {
      return { error: 'humanContext must be an object', field: 'humanContext' };
    }
    validated.humanContext = request.humanContext as RouteRequest['humanContext'];
  }

  // Optional constraints
  if (request.constraints !== undefined) {
    if (typeof request.constraints !== 'object' || request.constraints === null) {
      return { error: 'constraints must be an object', field: 'constraints' };
    }
    validated.constraints = request.constraints as RouteRequest['constraints'];
  }

  // Optional userTier
  if (request.userTier !== undefined) {
    const validTiers = new Set(Object.values(AccessTier));
    if (typeof request.userTier !== 'string' || !validTiers.has(request.userTier as AccessTier)) {
      return {
        error: `Invalid userTier. Must be one of: ${Object.values(AccessTier).join(', ')}`,
        field: 'userTier',
      };
    }
    validated.userTier = request.userTier as AccessTier;
  }

  // Optional availableProviders
  if (request.availableProviders !== undefined) {
    if (!Array.isArray(request.availableProviders)) {
      return { error: 'availableProviders must be an array', field: 'availableProviders' };
    }
    const validProviders: Set<string> = new Set(['openai', 'anthropic', 'google', 'perplexity', 'xai', 'mistral', 'meta', 'stability', 'elevenlabs', 'deepseek']);
    for (const provider of request.availableProviders) {
      if (typeof provider !== 'string' || !validProviders.has(provider)) {
        return {
          error: `Invalid provider in availableProviders. Must be one of: ${Array.from(validProviders).join(', ')}`,
          field: 'availableProviders',
        };
      }
    }
    validated.availableProviders = request.availableProviders as Provider[];
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

    // Execute routing
    const response = route(validation);

    // Store decision asynchronously (fire-and-forget)
    storeDecision({
      decisionId: response.decisionId,
      request: {
        prompt: validation.prompt,
        modality: validation.modality,
        hasContext: !!validation.context,
        hasHumanContext: !!validation.humanContext,
        hasConstraints: !!validation.constraints,
      },
      response,
      timestamp: new Date().toISOString(),
    }).catch((error) => {
      console.warn('Failed to store decision:', error);
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Route error:', error);
    return internalError('An error occurred while processing the routing request');
  }
}
