import {
  RouteRequest,
  RouteResponse,
  AnalyzeResponse,
  QueryAnalysis,
  Modality,
  ScoringContext,
  FallbackSuggestion,
  Intent,
} from '@/types';
import {
  analyze,
  getDefaultAnalysis,
  isPureModality,
  isCombinedModality,
  getModalityType,
} from '../analyzer';
import {
  scoreAllModels,
  quickScoreForModality,
  scoreCombinedModality,
} from '../scorer';
import { selectModels, selectFallback } from '../selector';
import {
  generateReasoning,
  generateFastPathReasoning,
  generateFallbackReasoning,
  generateReconciledReasoning,
} from '../reasoning';
import {
  getAvailableModels,
  filterModelsByConstraints,
  getModelsByModalityCapability,
} from '@/models';
import { generateDecisionId, measureTimeSync, round } from '@/lib/helpers';

// Maximum allowed routing time
const MAX_ROUTING_TIME_MS = 50;

// Main routing function
export function route(request: RouteRequest): RouteResponse {
  const startTime = performance.now();

  // Parse modality
  const modality = typeof request.modality === 'string'
    ? (request.modality as Modality)
    : request.modality;

  // Check for fast-path eligibility (pure image or voice)
  if (isPureModality(modality)) {
    const fastPathResult = handleFastPath(request, modality, startTime);
    return fastPathResult;
  }

  // Standard routing path
  return handleStandardRoute(request, modality, startTime);
}

// Handle fast-path for pure modality requests
function handleFastPath(
  request: RouteRequest,
  modality: Modality,
  startTime: number
): RouteResponse {
  const modalityType = getModalityType(modality);
  if (modalityType === 'text') {
    // Shouldn't happen for pure modality, fallback to standard
    return handleStandardRoute(request, modality, startTime);
  }

  // Get models with modality capability
  let models = getAvailableModels();

  // Apply constraints if any
  if (request.constraints) {
    models = filterModelsByConstraints(models, request.constraints);
  }

  // Quick score by modality capability
  const modalityModels = getModelsByModalityCapability(models, modalityType);
  const scores = quickScoreForModality(modalityModels, modalityType);

  if (scores.length === 0) {
    // Fallback if no models support this modality
    const fallbackModel = selectFallback(models);
    if (!fallbackModel) {
      throw new Error('No models available');
    }

    const totalMs = round(performance.now() - startTime, 2);
    return createFallbackResponse(fallbackModel, modality, totalMs);
  }

  // Select best
  const selection = selectModels(scores);

  // Generate reasoning
  const primaryReasoning = generateFastPathReasoning(selection.primary, modalityType);
  const backupReasonings = selection.backups.map((backup) =>
    generateFastPathReasoning(backup, modalityType)
  );

  // Create response
  const totalMs = round(performance.now() - startTime, 2);

  // Create simple analysis for fast-path
  const analysis: QueryAnalysis = {
    intent: 'task' as QueryAnalysis['intent'],
    domain: 'general' as QueryAnalysis['domain'],
    complexity: 'standard' as QueryAnalysis['complexity'],
    tone: 'casual' as QueryAnalysis['tone'],
    modality,
    keywords: [],
    humanContextUsed: false,
  };

  return {
    decisionId: generateDecisionId(),
    primaryModel: {
      id: selection.primary.model.id,
      name: selection.primary.model.name,
      provider: selection.primary.model.provider,
      score: round(selection.primary.compositeScore, 3),
      reasoning: primaryReasoning,
    },
    backupModels: selection.backups.map((backup, idx) => ({
      id: backup.model.id,
      name: backup.model.name,
      provider: backup.model.provider,
      score: round(backup.compositeScore, 3),
      reasoning: backupReasonings[idx]!,
    })),
    confidence: round(selection.confidence, 3),
    analysis,
    timing: {
      totalMs,
      analysisMs: 0,
      scoringMs: totalMs,
      selectionMs: 0,
    },
  };
}

// Handle standard routing path
function handleStandardRoute(
  request: RouteRequest,
  modality: Modality,
  startTime: number
): RouteResponse {
  // Step 1: Analyze the prompt
  const { result: analysis, durationMs: analysisMs } = measureTimeSync(() =>
    analyze(request.prompt, modality, request.humanContext)
  );

  // Step 2: Get and filter models
  let models = getAvailableModels();
  if (request.constraints) {
    models = filterModelsByConstraints(models, request.constraints);
  }

  if (models.length === 0) {
    // Try with relaxed constraints
    models = getAvailableModels();
    if (models.length === 0) {
      throw new Error('No models available');
    }
  }

  // Step 3: Handle combined modality if applicable
  if (isCombinedModality(modality)) {
    return handleCombinedModality(
      request,
      analysis,
      models,
      modality,
      startTime,
      analysisMs
    );
  }

  // Step 4: Score all models
  const scoringContext: ScoringContext = {
    analysis,
    humanContext: request.humanContext,
    constraints: request.constraints,
    conversationContext: request.context,
    allModels: models,
  };

  const { result: scores, durationMs: scoringMs } = measureTimeSync(() =>
    scoreAllModels(scoringContext)
  );

  // Step 5: Select models
  const { result: selection, durationMs: selectionMs } = measureTimeSync(() =>
    selectModels(scores)
  );

  // Step 6: Generate reasoning
  const primaryReasoning = generateReasoning(selection.primary, analysis, true);
  const backupReasonings = selection.backups.map((backup, idx) =>
    generateReasoning(backup, analysis, false, idx + 1)
  );

  // Calculate total time
  const totalMs = round(performance.now() - startTime, 2);

  // Log warning if over budget
  if (totalMs > MAX_ROUTING_TIME_MS) {
    console.warn(`Routing exceeded ${MAX_ROUTING_TIME_MS}ms: ${totalMs}ms`);
  }

  // Check if we should attach a fallback suggestion (low confidence or unsupported task)
  const fallback = detectFallbackNeeded(analysis, selection.confidence);

  return {
    decisionId: generateDecisionId(),
    primaryModel: {
      id: selection.primary.model.id,
      name: selection.primary.model.name,
      provider: selection.primary.model.provider,
      score: round(selection.primary.compositeScore, 3),
      reasoning: primaryReasoning,
    },
    backupModels: selection.backups.map((backup, idx) => ({
      id: backup.model.id,
      name: backup.model.name,
      provider: backup.model.provider,
      score: round(backup.compositeScore, 3),
      reasoning: backupReasonings[idx]!,
    })),
    confidence: round(selection.confidence, 3),
    analysis,
    timing: {
      totalMs,
      analysisMs: round(analysisMs, 2),
      scoringMs: round(scoringMs, 2),
      selectionMs: round(selectionMs, 2),
    },
    ...(fallback ? { fallback } : {}),
  };
}

// Handle combined modality requests
function handleCombinedModality(
  request: RouteRequest,
  analysis: QueryAnalysis,
  models: ModelDefinition[],
  modality: Modality,
  startTime: number,
  analysisMs: number
): RouteResponse {
  const modalityType = getModalityType(modality);

  // Score by modality
  const modalityModels = getModelsByModalityCapability(models, modalityType as 'vision' | 'audio');
  const modalityScores = quickScoreForModality(modalityModels, modalityType as 'vision' | 'audio');

  // Score by text analysis
  const scoringContext: ScoringContext = {
    analysis,
    humanContext: request.humanContext,
    constraints: request.constraints,
    conversationContext: request.context,
    allModels: models,
  };

  const { result: textScores, durationMs: scoringMs } = measureTimeSync(() =>
    scoreAllModels(scoringContext)
  );

  // Combine scores (60% modality, 40% text)
  const combinedScores = scoreCombinedModality(textScores, modalityScores);

  if (combinedScores.length === 0) {
    // Fallback
    const fallbackModel = selectFallback(models);
    if (!fallbackModel) {
      throw new Error('No models available');
    }
    const totalMs = round(performance.now() - startTime, 2);
    return createFallbackResponse(fallbackModel, modality, totalMs);
  }

  // Select from combined scores
  const { result: selection, durationMs: selectionMs } = measureTimeSync(() =>
    selectModels(combinedScores)
  );

  // Generate reconciled reasoning
  const primaryReasoning = generateReconciledReasoning(
    selection.primary,
    analysis,
    modalityType as 'vision' | 'audio'
  );
  const backupReasonings = selection.backups.map((backup) =>
    generateReconciledReasoning(backup, analysis, modalityType as 'vision' | 'audio')
  );

  const totalMs = round(performance.now() - startTime, 2);

  return {
    decisionId: generateDecisionId(),
    primaryModel: {
      id: selection.primary.model.id,
      name: selection.primary.model.name,
      provider: selection.primary.model.provider,
      score: round(selection.primary.compositeScore, 3),
      reasoning: primaryReasoning,
    },
    backupModels: selection.backups.map((backup, idx) => ({
      id: backup.model.id,
      name: backup.model.name,
      provider: backup.model.provider,
      score: round(backup.compositeScore, 3),
      reasoning: backupReasonings[idx]!,
    })),
    confidence: round(selection.confidence, 3),
    analysis,
    timing: {
      totalMs,
      analysisMs: round(analysisMs, 2),
      scoringMs: round(scoringMs, 2),
      selectionMs: round(selectionMs, 2),
    },
  };
}

// Create fallback response
function createFallbackResponse(
  model: ModelDefinition,
  modality: Modality,
  totalMs: number
): RouteResponse {
  const reasoning = generateFallbackReasoning(model);

  return {
    decisionId: generateDecisionId(),
    primaryModel: {
      id: model.id,
      name: model.name,
      provider: model.provider,
      score: 0.5,
      reasoning,
    },
    backupModels: [],
    confidence: 0.5,
    analysis: getDefaultAnalysis(modality),
    timing: {
      totalMs,
      analysisMs: 0,
      scoringMs: 0,
      selectionMs: 0,
    },
  };
}

// Analyze-only function
export function analyzeOnly(prompt: string, modality: Modality): AnalyzeResponse {
  const startTime = performance.now();

  const analysis = analyze(prompt, modality);

  const analysisMs = round(performance.now() - startTime, 2);

  return {
    analysis,
    timing: {
      analysisMs,
    },
  };
}

// Import ModelDefinition for type usage
import type { ModelDefinition } from '@/types';

// Fallback suggestion mappings for unsupported or low-confidence tasks
const FALLBACK_SUGGESTIONS: Partial<Record<Intent, { category: string; message: string; suggestedPlatforms: string[] }>> = {
  [Intent.ImageGeneration]: {
    category: 'Image Generation',
    message: 'For best results with image generation, we recommend using a specialized image generation platform. The models in our registry that support this are limited - consider using the suggested platforms directly for production-quality image generation.',
    suggestedPlatforms: ['OpenAI DALL-E 3', 'Google Imagen 3', 'Stability AI (Stable Diffusion)', 'Midjourney'],
  },
  [Intent.VideoGeneration]: {
    category: 'Video Generation',
    message: 'Video generation requires specialized AI models. While our registry includes some video generation models, this capability is still emerging. For production use, consider the suggested platforms.',
    suggestedPlatforms: ['OpenAI Sora', 'Google Veo 2', 'Runway ML', 'Pika Labs'],
  },
  [Intent.VoiceGeneration]: {
    category: 'Voice & Speech Generation',
    message: 'Text-to-speech and voice generation is best handled by specialized voice AI platforms. Our registry includes some TTS models, but for voice cloning and advanced speech synthesis, consider dedicated platforms.',
    suggestedPlatforms: ['ElevenLabs', 'OpenAI TTS', 'Google Cloud TTS', 'Amazon Polly'],
  },
  [Intent.MusicGeneration]: {
    category: 'Music Generation',
    message: 'AI music generation is a specialized capability not widely available through standard LLM providers. For creating music, songs, and audio compositions, use a dedicated music AI platform.',
    suggestedPlatforms: ['Suno AI', 'Udio', 'AIVA', 'Soundraw'],
  },
};

// Detect if a fallback suggestion should be attached
function detectFallbackNeeded(
  analysis: QueryAnalysis,
  confidence: number
): FallbackSuggestion | null {
  // If confidence is very low, the primary model is probably not great for this task
  if (confidence < 0.25) {
    const suggestion = FALLBACK_SUGGESTIONS[analysis.intent];
    if (suggestion) {
      return {
        supported: false,
        ...suggestion,
      };
    }

    // Generic fallback for unknown low-confidence scenarios
    return {
      supported: false,
      category: 'Unsupported Task',
      message: 'This task type may not be well-supported by the models currently in our registry. The recommended model is a best-effort suggestion. For specialized tasks, consider using a platform that specifically caters to your needs.',
      suggestedPlatforms: ['OpenAI ChatGPT', 'Google Gemini', 'Anthropic Claude', 'Perplexity AI'],
    };
  }

  return null;
}
