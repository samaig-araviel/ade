// Import ModelDefinition for type usage
import type {ModelDefinition} from '@/types';
import {
  AccessTier,
  AnalyzeResponse,
  FallbackSuggestion,
  Intent,
  Modality,
  ModelScore,
  Provider,
  ProviderHint,
  QueryAnalysis,
  RouteRequest,
  RouteResponse,
  ScoringContext,
  UpgradeHint,
} from '@/types';
import {analyze, getDefaultAnalysis, getModalityType, isCombinedModality, isPureModality,} from '../analyzer';
import {quickScoreForModality, scoreAllModels, scoreCombinedModality,} from '../scorer';
import {selectFallback, selectModels} from '../selector';
import {
  generateFallbackReasoning,
  generateFastPathReasoning,
  generateReasoning,
  generateReconciledReasoning,
} from '../reasoning';
import {
  filterModelsByConstraints,
  getAvailableModels,
  getModelsByModalityCapability,
  getModelsForTier,
} from '@/models';
import {generateDecisionId, measureTimeSync, round} from '@/lib/helpers';

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
    return handleFastPath(request, modality, startTime);
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
  let models = getModelsForTier(request.userTier ?? AccessTier.Free);

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

  // Apply provider constraint if set
  const { filteredScores, providerHint, noProvidersAvailable, originalBestModel } =
    filterByAvailableProviders(scores, request.availableProviders);

  if (noProvidersAvailable) {
    const totalMs = round(performance.now() - startTime, 2);
    return createProviderUnavailableResponse(originalBestModel!, modality, totalMs);
  }

  // Select best
  const selection = selectModels(filteredScores);

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
    webSearchRequired: false,
  };

  return {
    decisionId: generateDecisionId(),
    primaryModel: {
      id: selection.primary.model.id,
      name: selection.primary.model.name,
      provider: selection.primary.model.provider,
      score: round(selection.primary.compositeScore, 3),
      reasoning: primaryReasoning,
      supportsWebSearch: !!selection.primary.model.capabilities.supportsWebSearch,
    },
    backupModels: selection.backups.map((backup, idx) => ({
      id: backup.model.id,
      name: backup.model.name,
      provider: backup.model.provider,
      score: round(backup.compositeScore, 3),
      reasoning: backupReasonings[idx]!,
      supportsWebSearch: !!backup.model.capabilities.supportsWebSearch,
    })),
    confidence: round(selection.confidence, 3),
    analysis,
    timing: {
      totalMs,
      analysisMs: 0,
      scoringMs: totalMs,
      selectionMs: 0,
    },
    webSearchRequired: false,
    ...(providerHint ? { providerHint } : {}),
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

  // Step 2: Get and filter models (gated by user's subscription tier)
  const userTier = request.userTier ?? AccessTier.Free;
  let models = getModelsForTier(userTier);
  if (request.constraints) {
    models = filterModelsByConstraints(models, request.constraints);
  }

  if (models.length === 0) {
    // Try with relaxed constraints but still respect tier
    models = getModelsForTier(userTier);
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

  // Step 5: Apply provider constraint if set
  const { filteredScores, providerHint, noProvidersAvailable, originalBestModel } =
    filterByAvailableProviders(scores, request.availableProviders);

  if (noProvidersAvailable) {
    const totalMs = round(performance.now() - startTime, 2);
    return createProviderUnavailableResponse(originalBestModel!, modality, totalMs, analysis);
  }

  // Step 6: Select models
  const { result: selection, durationMs: selectionMs } = measureTimeSync(() =>
    selectModels(filteredScores)
  );

  // Step 7: Generate reasoning
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

  // Generate upgrade hint for free-tier users if a better pro model exists
  const upgradeHint = userTier === AccessTier.Free
      ? generateUpgradeHint(analysis, selection.primary, request)
      : undefined;

  return {
    decisionId: generateDecisionId(),
    primaryModel: {
      id: selection.primary.model.id,
      name: selection.primary.model.name,
      provider: selection.primary.model.provider,
      score: round(selection.primary.compositeScore, 3),
      reasoning: primaryReasoning,
      supportsWebSearch: !!selection.primary.model.capabilities.supportsWebSearch,
    },
    backupModels: selection.backups.map((backup, idx) => ({
      id: backup.model.id,
      name: backup.model.name,
      provider: backup.model.provider,
      score: round(backup.compositeScore, 3),
      reasoning: backupReasonings[idx]!,
      supportsWebSearch: !!backup.model.capabilities.supportsWebSearch,
    })),
    confidence: round(selection.confidence, 3),
    analysis,
    timing: {
      totalMs,
      analysisMs: round(analysisMs, 2),
      scoringMs: round(scoringMs, 2),
      selectionMs: round(selectionMs, 2),
    },
    webSearchRequired: analysis.webSearchRequired,
    ...(fallback ? { fallback } : {}),
    ...(upgradeHint ? { upgradeHint } : {}),
    ...(providerHint ? { providerHint } : {}),
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

  // Apply provider constraint if set
  const { filteredScores, providerHint, noProvidersAvailable, originalBestModel } =
    filterByAvailableProviders(combinedScores, request.availableProviders);

  if (noProvidersAvailable) {
    const totalMs = round(performance.now() - startTime, 2);
    return createProviderUnavailableResponse(originalBestModel!, modality, totalMs, analysis);
  }

  // Select from combined scores
  const { result: selection, durationMs: selectionMs } = measureTimeSync(() =>
    selectModels(filteredScores)
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
      supportsWebSearch: !!selection.primary.model.capabilities.supportsWebSearch,
    },
    backupModels: selection.backups.map((backup, idx) => ({
      id: backup.model.id,
      name: backup.model.name,
      provider: backup.model.provider,
      score: round(backup.compositeScore, 3),
      reasoning: backupReasonings[idx]!,
      supportsWebSearch: !!backup.model.capabilities.supportsWebSearch,
    })),
    confidence: round(selection.confidence, 3),
    analysis,
    timing: {
      totalMs,
      analysisMs: round(analysisMs, 2),
      scoringMs: round(scoringMs, 2),
      selectionMs: round(selectionMs, 2),
    },
    webSearchRequired: analysis.webSearchRequired,
    ...(providerHint ? { providerHint } : {}),
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
      supportsWebSearch: !!model.capabilities.supportsWebSearch,
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
    webSearchRequired: false,
  };
}

// Result of filtering scored models by available providers
interface ProviderFilterResult {
  filteredScores: ModelScore[];
  providerHint: ProviderHint | undefined;
  noProvidersAvailable: boolean;
  originalBestModel?: ModelDefinition;
}

// Filter scored models to only those from available providers
function filterByAvailableProviders(
  scores: ModelScore[],
  availableProviders: Provider[] | undefined
): ProviderFilterResult {
  if (!availableProviders || availableProviders.length === 0) {
    return {
      filteredScores: scores,
      providerHint: undefined,
      noProvidersAvailable: false,
    };
  }

  const availableScores = scores.filter(
    s => availableProviders.includes(s.model.provider as Provider)
  );

  if (availableScores.length === 0) {
    return {
      filteredScores: scores,
      providerHint: undefined,
      noProvidersAvailable: true,
      originalBestModel: scores[0]?.model,
    };
  }

  let providerHint: ProviderHint | undefined;

  if (scores.length > 0 && !availableProviders.includes(scores[0]!.model.provider as Provider)) {
    const originalBest = scores[0]!;
    const newBest = availableScores[0]!;
    providerHint = {
      recommendedModel: {
        id: originalBest.model.id,
        name: originalBest.model.name,
        provider: originalBest.model.provider,
      },
      reason: `${originalBest.model.name} scored highest for this query but ${originalBest.model.provider} is not currently available`,
      scoreDifference: round(originalBest.compositeScore - newBest.compositeScore, 3),
    };
  }

  return {
    filteredScores: availableScores,
    providerHint,
    noProvidersAvailable: false,
  };
}

// Create fallback response when no models from available providers exist
function createProviderUnavailableResponse(
  bestModel: ModelDefinition,
  modality: Modality,
  totalMs: number,
  analysis?: QueryAnalysis
): RouteResponse {
  const reasoning = generateFallbackReasoning(bestModel);

  const resolvedAnalysis = analysis ?? getDefaultAnalysis(modality);

  return {
    decisionId: generateDecisionId(),
    primaryModel: {
      id: bestModel.id,
      name: bestModel.name,
      provider: bestModel.provider,
      score: 0,
      reasoning,
      supportsWebSearch: !!bestModel.capabilities.supportsWebSearch,
    },
    backupModels: [],
    confidence: 0,
    analysis: resolvedAnalysis,
    timing: {
      totalMs,
      analysisMs: 0,
      scoringMs: 0,
      selectionMs: 0,
    },
    webSearchRequired: resolvedAnalysis.webSearchRequired,
    fallback: {
      supported: false,
      category: 'Provider Unavailable',
      message: `Our top recommendation for this query is ${bestModel.name} (${bestModel.provider}), but this provider is not currently configured. Please configure an API key for ${bestModel.provider} or another supported provider to get started.`,
      suggestedPlatforms: [bestModel.provider],
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

// Generate upgrade hint for free-tier users
function generateUpgradeHint(
    analysis: QueryAnalysis,
    freeSelection: ModelScore,
    request: RouteRequest
): UpgradeHint | undefined {
  // Score ALL models (including pro) to find the true best
  const allModels = getAvailableModels();
  const filteredAll = request.constraints
      ? filterModelsByConstraints(allModels, request.constraints)
      : allModels;

  const fullContext: ScoringContext = {
    analysis,
    humanContext: request.humanContext,
    constraints: request.constraints,
    conversationContext: request.context,
    allModels: filteredAll,
  };

  const allScores = scoreAllModels(fullContext);
  if (allScores.length === 0) return undefined;

  const bestOverall = allScores[0]!;
  const scoreDiff = bestOverall.compositeScore - freeSelection.compositeScore;

  // Only show hint if pro model is meaningfully better (>= 5% gap)
  if (scoreDiff < 0.05 || bestOverall.model.id === freeSelection.model.id) {
    return undefined;
  }

  return {
    recommendedModel: {
      id: bestOverall.model.id,
      name: bestOverall.model.name,
      provider: bestOverall.model.provider,
    },
    reason: buildUpgradeReason(bestOverall.model, analysis),
    scoreDifference: round(scoreDiff, 3),
  };
}

// Build human-readable upgrade reason based on query intent
function buildUpgradeReason(model: ModelDefinition, analysis: QueryAnalysis): string {
  const intentLabels: Record<string, string> = {
    coding: 'coding tasks',
    creative: 'creative writing',
    analysis: 'analytical tasks',
    factual: 'factual research',
    conversation: 'natural conversations',
    task: 'task execution',
    brainstorm: 'brainstorming',
    translation: 'translation',
    summarization: 'summarization',
    extraction: 'data extraction',
    research: 'in-depth research',
    math: 'mathematical reasoning',
    planning: 'planning and strategy',
    image_generation: 'image generation',
    video_generation: 'video generation',
    voice_generation: 'voice generation',
    music_generation: 'music generation',
  };

  const taskLabel = intentLabels[analysis.intent] ?? 'this type of task';
  return `${model.name} excels at ${taskLabel} with higher accuracy and deeper reasoning.`;
}
