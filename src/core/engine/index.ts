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
import {quickScoreForModality, quickScoreForImageGeneration, scoreAllModels, scoreCombinedModality,} from '../scorer';
import {selectFallback, selectModels} from '../selector';
import {
  generateFallbackReasoning,
  generateFastPathReasoning,
  generateReasoning,
  generateReconciledReasoning,
} from '../reasoning';
import {
  filterModelsByConstraints,
  getImageGenerationModels,
  getModelsByModalityCapability,
  getModelsForTier,
  isDedicatedImageModel,
} from '@/models';
import {generateDecisionId, measureTimeSync, round} from '@/lib/helpers';
import {logger} from '@/lib/logger';

const engineLog = logger.child({module: 'engine'});

// Maximum allowed routing time
const MAX_ROUTING_TIME_MS = 50;

// Main routing function
export function route(request: RouteRequest): RouteResponse {
  const startTime = performance.now();

  // Parse modality
  const modality = typeof request.modality === 'string'
    ? (request.modality as Modality)
    : request.modality;

  // Image modality = user explicitly wants image generation (e.g. from image gallery view)
  // Skip intent detection entirely and route directly to image-generation-capable models
  if (modality === Modality.Image) {
    return handleImageGenerationRoute(request, startTime);
  }

  // Check for fast-path eligibility (pure voice or video)
  if (isPureModality(modality)) {
    return handleFastPath(request, modality, startTime);
  }

  // Standard routing path
  return handleStandardRoute(request, modality, startTime);
}

// Handle image generation routing - when modality is 'image' or intent is image_generation
function handleImageGenerationRoute(
  request: RouteRequest,
  startTime: number
): RouteResponse {
  // Get models gated by user tier
  let models = getModelsForTier(request.userTier ?? AccessTier.Free);

  // Apply constraints if any
  if (request.constraints) {
    models = filterModelsByConstraints(models, request.constraints);
  }

  // Filter to only image-generation-capable models
  const imageModels = getImageGenerationModels(models);

  // Score image generation models
  const scores = quickScoreForImageGeneration(imageModels);

  if (scores.length === 0) {
    // No image-generation models available - return fallback with helpful suggestion
    const totalMs = round(performance.now() - startTime, 2);
    const fallbackModel = selectFallback(models);
    if (!fallbackModel) {
      throw new Error('No models available');
    }
    return createImageGenerationFallbackResponse(fallbackModel, totalMs);
  }

  // Apply provider constraint if set
  const { filteredScores, providerHint, noProvidersAvailable, originalBestModel } =
    filterByAvailableProviders(scores, request.availableProviders);

  if (noProvidersAvailable) {
    const totalMs = round(performance.now() - startTime, 2);
    return createProviderUnavailableResponse(originalBestModel!, Modality.Image, totalMs);
  }

  // Ensure backup diversity: if primary is a dedicated image model (e.g. Imagen),
  // include at least one streaming-capable model with native image generation as backup.
  // This gives the backend a viable Responses API / Gemini streaming fallback.
  const diverseScores = ensureImageBackupDiversity(filteredScores);

  // Select best
  const selection = selectModels(diverseScores);

  // Generate reasoning
  const primaryReasoning = generateFastPathReasoning(selection.primary, 'image_generation');
  const backupReasonings = selection.backups.map((backup) =>
    generateFastPathReasoning(backup, 'image_generation')
  );

  const totalMs = round(performance.now() - startTime, 2);

  const analysis: QueryAnalysis = {
    intent: Intent.ImageGeneration,
    domain: 'creative_arts' as QueryAnalysis['domain'],
    complexity: 'standard' as QueryAnalysis['complexity'],
    tone: 'default' as QueryAnalysis['tone'],
    modality: Modality.Image,
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
      ...(isDedicatedImageModel(selection.primary.model) ? { dedicatedImageModel: true } : {}),
    },
    backupModels: selection.backups.map((backup, idx) => ({
      id: backup.model.id,
      name: backup.model.name,
      provider: backup.model.provider,
      score: round(backup.compositeScore, 3),
      reasoning: backupReasonings[idx]!,
      supportsWebSearch: !!backup.model.capabilities.supportsWebSearch,
      ...(isDedicatedImageModel(backup.model) ? { dedicatedImageModel: true } : {}),
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

// Create fallback response specifically for image generation when no image models are available
function createImageGenerationFallbackResponse(
  model: ModelDefinition,
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
    analysis: {
      intent: Intent.ImageGeneration,
      domain: 'creative_arts' as QueryAnalysis['domain'],
      complexity: 'standard' as QueryAnalysis['complexity'],
      tone: 'default' as QueryAnalysis['tone'],
      modality: Modality.Image,
      keywords: [],
      humanContextUsed: false,
      webSearchRequired: false,
    },
    timing: {
      totalMs,
      analysisMs: 0,
      scoringMs: 0,
      selectionMs: 0,
    },
    webSearchRequired: false,
    fallback: {
      supported: false,
      category: 'Image Generation',
      message: 'For best results with image generation, we recommend using a specialized image generation model. Consider selecting one of the suggested platforms.',
      suggestedPlatforms: ['GPT Image 2', 'GPT Image 1.5', 'Imagen 4 Standard', 'GPT-5.4', 'GPT-4o', 'Nano Banana 2'],
    },
  };
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
    tone: 'default' as QueryAnalysis['tone'],
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

  // Step 3: If intent is image generation, filter to image-capable models only
  if (analysis.intent === Intent.ImageGeneration) {
    const imageModels = getImageGenerationModels(models);
    if (imageModels.length > 0) {
      // Score only image-generation-capable models
      const { result: imageScores, durationMs: scoringMs } = measureTimeSync(() =>
        quickScoreForImageGeneration(imageModels)
      );

      const { filteredScores: imgFiltered, providerHint: imgProviderHint, noProvidersAvailable: imgNoProviders, originalBestModel: imgOrigBest } =
        filterByAvailableProviders(imageScores, request.availableProviders);

      if (imgNoProviders) {
        const totalMs = round(performance.now() - startTime, 2);
        return createProviderUnavailableResponse(imgOrigBest!, modality, totalMs, analysis);
      }

      // Ensure backup diversity: mix dedicated (Imagen) and streaming-capable image models
      const diverseImgScores = ensureImageBackupDiversity(imgFiltered);

      const { result: selection, durationMs: selectionMs } = measureTimeSync(() =>
        selectModels(diverseImgScores)
      );

      const primaryReasoning = generateReasoning(selection.primary, analysis, true);
      const backupReasonings = selection.backups.map((backup, idx) =>
        generateReasoning(backup, analysis, false, idx + 1)
      );

      const totalMs = round(performance.now() - startTime, 2);

      const userTierForUpgrade = request.userTier ?? AccessTier.Free;
      const upgradeHint = userTierForUpgrade !== AccessTier.Pro
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
          ...(isDedicatedImageModel(selection.primary.model) ? { dedicatedImageModel: true } : {}),
        },
        backupModels: selection.backups.map((backup, idx) => ({
          id: backup.model.id,
          name: backup.model.name,
          provider: backup.model.provider,
          score: round(backup.compositeScore, 3),
          reasoning: backupReasonings[idx]!,
          supportsWebSearch: !!backup.model.capabilities.supportsWebSearch,
          ...(isDedicatedImageModel(backup.model) ? { dedicatedImageModel: true } : {}),
        })),
        confidence: round(selection.confidence, 3),
        analysis,
        timing: {
          totalMs,
          analysisMs: round(analysisMs, 2),
          scoringMs: round(scoringMs, 2),
          selectionMs: round(selectionMs, 2),
        },
        webSearchRequired: false,
        ...(upgradeHint ? { upgradeHint } : {}),
        ...(imgProviderHint ? { providerHint: imgProviderHint } : {}),
      };
    }
    // If no image models available, fall through to standard scoring with fallback
  }

  // Step 3b: Handle combined modality if applicable
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
    conversationHasImages: request.conversationHasImages,
    strategy: request.strategy,
    userTier,
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
    engineLog.warn('Routing exceeded budget', {
      budgetMs: MAX_ROUTING_TIME_MS,
      actualMs: totalMs,
    });
  }

  // Check if we should attach a fallback suggestion (low confidence or unsupported task)
  const fallback = detectFallbackNeeded(analysis, selection.confidence);

  // Generate upgrade hint for non-premium users if a better higher-tier model exists
  const upgradeHint = userTier !== AccessTier.Pro
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
    conversationHasImages: request.conversationHasImages,
    strategy: request.strategy,
    userTier: request.userTier ?? AccessTier.Free,
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
    message: 'For best results with image generation, we recommend using a specialized image generation model or a multimodal model with native image generation support.',
    suggestedPlatforms: ['GPT Image 2', 'GPT Image 1.5', 'Imagen 4 Standard', 'GPT-5.4', 'GPT-4o', 'Nano Banana 2'],
  },
  [Intent.VideoGeneration]: {
    category: 'Video Generation',
    message: 'Video generation requires specialized AI models. Our registry includes Veo 3.1 for Premium users.',
    suggestedPlatforms: ['Veo 3.1'],
  },
  [Intent.VoiceGeneration]: {
    category: 'Voice & Speech Generation',
    message: 'Text-to-speech and voice generation is handled by specialized voice AI models in our registry, including ElevenLabs TTS and GPT-4o Mini TTS.',
    suggestedPlatforms: ['ElevenLabs TTS Flash', 'ElevenLabs TTS Multilingual', 'GPT-4o Mini TTS', 'Gemini 2.5 Flash TTS'],
  },
  [Intent.MusicGeneration]: {
    category: 'Music Generation',
    message: 'AI music generation is available through ElevenLabs Music in our registry. For more options, consider dedicated music AI platforms.',
    suggestedPlatforms: ['ElevenLabs Music'],
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

// Smart tier-aware upgrade hint generation.
//
// For Free users: suggests the nearest tier (Lite) unless Pro is significantly
// better — lowering the barrier to upgrade while still surfacing compelling
// Pro models when they clearly outperform.
//
// For Lite users: suggests Pro when a meaningful improvement exists.
//
// Higher tiers are scored from scratch under the hypothetical tier's context so
// any tier-specific scoring bonuses (e.g. Free tier provider preference) don't
// leak into the upgrade comparison.
function generateUpgradeHint(
    analysis: QueryAnalysis,
    currentSelection: ModelScore,
    request: RouteRequest
): UpgradeHint | undefined {
  const userTier = request.userTier ?? AccessTier.Free;

  // Determine which higher tiers to evaluate
  const nextTier = userTier === AccessTier.Free ? AccessTier.Lite : AccessTier.Pro;
  const hasJumpTier = userTier === AccessTier.Free; // Free can jump to Pro

  // Build scoring context helper. `tier` here is the hypothetical tier being
  // evaluated for an upgrade — its tier-aware preferences should govern scoring,
  // not the user's current tier.
  const buildContext = (models: ModelDefinition[], tier: AccessTier): ScoringContext => ({
    analysis,
    humanContext: request.humanContext,
    constraints: request.constraints,
    conversationContext: request.context,
    allModels: models,
    strategy: request.strategy,
    userTier: tier,
  });

  // Score models for a given tier from scratch. We re-score rather than reuse
  // already-scored results because the user's current-tier scores carry
  // tier-specific bonuses that wouldn't apply at the hypothetical higher tier.
  const scoreForTier = (tier: AccessTier): ModelScore[] => {
    const tierModels = getModelsForTier(tier);
    const filtered = request.constraints
      ? filterModelsByConstraints(tierModels, request.constraints)
      : tierModels;

    return scoreAllModels(buildContext(filtered, tier));
  };

  // Score the next tier up (Lite for Free users, Pro for Lite users)
  const nextTierScores = scoreForTier(nextTier);
  const bestNextTier = nextTierScores[0];

  // For Free users, also evaluate Pro tier to see if it's worth the jump
  let bestJumpTier: ModelScore | undefined;
  if (hasJumpTier) {
    const jumpTierScores = scoreForTier(AccessTier.Pro);
    bestJumpTier = jumpTierScores[0];
  }

  // Decide which tier to recommend
  const minGap = 0.05; // Minimum score gap to show any hint
  const jumpThreshold = 0.08; // Extra gap needed to suggest Pro over Lite for Free users

  const nextGap = bestNextTier
    ? bestNextTier.compositeScore - currentSelection.compositeScore
    : 0;
  const jumpGap = bestJumpTier
    ? bestJumpTier.compositeScore - currentSelection.compositeScore
    : 0;

  // No meaningful improvement at any tier
  if (nextGap < minGap && jumpGap < minGap) return undefined;

  let chosen: ModelScore;
  let targetTier: AccessTier;

  if (hasJumpTier && bestJumpTier && jumpGap >= jumpThreshold && jumpGap - nextGap >= 0.03) {
    // Pro is significantly better than Lite — suggest the jump
    chosen = bestJumpTier;
    targetTier = AccessTier.Pro;
  } else if (bestNextTier && nextGap >= minGap) {
    // Nearest tier has a meaningful improvement — suggest it (lower barrier)
    chosen = bestNextTier;
    targetTier = nextTier;
  } else if (bestJumpTier && jumpGap >= minGap) {
    // Only Pro has an improvement (Lite didn't clear the gap)
    chosen = bestJumpTier;
    targetTier = AccessTier.Pro;
  } else {
    return undefined;
  }

  // Don't suggest the same model already selected
  if (chosen.model.id === currentSelection.model.id) return undefined;

  return {
    recommendedModel: {
      id: chosen.model.id,
      name: chosen.model.name,
      provider: chosen.model.provider,
    },
    targetTier,
    reason: buildUpgradeReason(chosen.model, analysis),
    scoreDifference: round(chosen.compositeScore - currentSelection.compositeScore, 3),
  };
}

// Ensure image generation backup diversity: if the top 3 models are all dedicated
// image API models (e.g. Imagen), promote the best streaming-capable model (one that
// supports native image gen via Responses API or Gemini streaming) into a backup slot.
// This ensures the backend always has a streaming fallback when dedicated APIs fail.
function ensureImageBackupDiversity(scores: ModelScore[]): ModelScore[] {
  if (scores.length < 3) return scores;

  const top3 = scores.slice(0, 3);
  const allDedicated = top3.every(s => isDedicatedImageModel(s.model));

  if (!allDedicated) return scores; // Already has a general-purpose model in top 3

  // Find the best general-purpose model with image generation
  const bestGeneralPurpose = scores.find(s => !isDedicatedImageModel(s.model));
  if (!bestGeneralPurpose) return scores; // No general-purpose models available

  // Swap the last backup (#3) with the best general-purpose model
  const gpIndex = scores.indexOf(bestGeneralPurpose);
  const result = [...scores];
  result[2] = bestGeneralPurpose;
  result[gpIndex] = top3[2]!;

  return result;
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
