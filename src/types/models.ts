import {
  Provider,
  Intent,
  Domain,
  Complexity,
  AccessTier,
} from './enums';

// Pricing information in USD
export interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
  cachedInputPer1k?: number;
}

// Tool-specific pricing
export interface ToolPricing {
  webSearchPer1k?: number;
  searchGroundingPer1k?: number;
  requestFeePer1k?: number;
}

// Model capabilities
export interface ModelCapabilities {
  maxInputTokens: number;
  maxOutputTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsAudio: boolean;
  supportsFunctionCalling: boolean;
  supportsJsonMode: boolean;
  supportsExtendedThinking?: boolean;
  supportsAdaptiveThinking?: boolean;
  supportsReasoning?: boolean;
  supportsWebSearch?: boolean;
  supportsImageGeneration?: boolean;
  supportsVideoGeneration?: boolean;
  supportsCodeExecution?: boolean;
  supportsTTS?: boolean;
  supportsSTT?: boolean;
  supportsRealtimeAudio?: boolean;
  visionScore: number; // 0-1
  audioScore: number; // 0-1
}

// Performance metrics
export interface ModelPerformance {
  avgLatencyMs: number;
  reliabilityPercent: number;
}

// Task strength scores (0-1 for each)
export interface TaskStrengths {
  intents: Record<Intent, number>;
  domains: Record<Domain, number>;
  complexity: Record<Complexity, number>;
}

// Human factors scores (0-1 for each)
export interface HumanFactors {
  empathyScore: number;
  playfulnessScore: number;
  professionalismScore: number;
  conciseness: number;
  verbosity: number;
  conversationalTone: number;
  formalTone: number;
  lateNightSuitability: number;
  workHoursSuitability: number;
}

// Model specialization categories
export type Specialization =
  | 'coding'
  | 'agentic_coding'
  | 'agentic'
  | 'web_search'
  | 'x_search'
  | 'multimodal'
  | 'fast_tasks'
  | 'reasoning'
  | 'creative_writing'
  | 'general_purpose'
  | 'budget'
  | 'image_generation'
  | 'image_editing'
  | 'video_generation'
  | 'voice_generation'
  | 'voice_cloning'
  | 'music_generation'
  | 'sound_effects'
  | 'audio_generation'
  | 'audio_processing'
  | 'voice_isolation'
  | 'noise_removal'
  | 'multilingual'
  | 'multilingual_voice'
  | 'multilingual_stt'
  | 'premium_voice'
  | 'research'
  | 'deep_research'
  | 'math'
  | 'long_context'
  | 'instruction_following'
  | 'classification'
  | 'summarization'
  | 'extended_thinking'
  | 'tts'
  | 'stt'
  | 'transcription'
  | 'voice_agents'
  | 'realtime_audio'
  | 'realtime_data'
  | 'fact_checking'
  | 'citations'
  | 'multi_step_search'
  | 'comprehensive_reports'
  | 'ultra_premium';

/**
 * Lifecycle metadata for a deprecated model.
 *
 * Distinct from `available: false` (which can also mean "dormant /
 * pre-positioned, not enabled yet"). When `deprecated` is set, the model has
 * been announced as retiring or already retired by its provider and should
 * also carry `available: false` so it does not surface in the catalog.
 *
 * The fields here are documentation + audit metadata: the routing/UI layer
 * uses them to log structured deprecation events and to display sunset info
 * if we ever choose to expose deprecated models during a transition window.
 */
export interface DeprecationInfo {
  /**
   * ISO date the model was deprecated. Used for audit, sorting, and
   * "deprecated since" UI surfacing.
   */
  dateDeprecated: string;
  /**
   * ISO date the model actually stops working (provider sunset). Set this
   * when the provider has announced a shutdown date; routing/alerting can
   * sort by `dateSunset` to surface upcoming retirements that still need
   * a replacement wired up.
   */
  dateSunset?: string;
  /** Optional ID of the documented replacement model. */
  replacedBy?: string;
  /** Optional human-readable reason for deprecation. */
  reason?: string;
}

// Complete model definition
export interface ModelDefinition {
  // Identity
  id: string;
  name: string;
  provider: Provider;
  description: string;

  // Pricing
  pricing: ModelPricing;

  // Capabilities
  capabilities: ModelCapabilities;

  // Performance
  performance: ModelPerformance;

  // Task strengths
  taskStrengths: TaskStrengths;

  // Human factors
  humanFactors: HumanFactors;

  // Specializations - what this model is purpose-built for
  specializations: Specialization[];

  // Access control - which subscription tier can use this model
  accessTier: AccessTier;

  // Credit cost for usage tracking
  creditCost?: number;

  // Tool-specific pricing
  toolPricing?: ToolPricing;

  // Availability
  available: boolean;

  // Lifecycle — set when the provider has announced deprecation. Always
  // accompanied by `available: false` so the catalog hides it.
  deprecated?: DeprecationInfo;
}

// Simplified model info for API responses
export interface ModelInfo {
  id: string;
  name: string;
  provider: Provider;
  description: string;
  pricing: ModelPricing;
  capabilities: {
    maxInputTokens: number;
    maxOutputTokens: number;
    supportsStreaming: boolean;
    supportsVision: boolean;
    supportsAudio: boolean;
    supportsFunctionCalling: boolean;
    supportsJsonMode: boolean;
    supportsWebSearch: boolean;
    supportsExtendedThinking: boolean;
    supportsImageGeneration: boolean;
    supportsTTS: boolean;
    supportsSTT: boolean;
  };
  performance: {
    avgLatencyMs: number;
    reliabilityPercent: number;
  };
  accessTier: AccessTier;
  creditCost?: number;
  available: boolean;
  deprecated?: DeprecationInfo;
}
