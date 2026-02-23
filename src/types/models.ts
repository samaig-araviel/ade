import {
  Provider,
  Intent,
  Domain,
  Complexity,
} from './enums';

// Pricing information in USD
export interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
  cachedInputPer1k?: number;
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
  supportsReasoning?: boolean;
  supportsWebSearch?: boolean;
  supportsImageGeneration?: boolean;
  supportsVideoGeneration?: boolean;
  supportsTTS?: boolean;
  supportsMusicGeneration?: boolean;
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
  | 'web_search'
  | 'multimodal'
  | 'fast_tasks'
  | 'reasoning'
  | 'creative_writing'
  | 'general_purpose'
  | 'budget'
  | 'image_generation'
  | 'video_generation'
  | 'voice_generation'
  | 'music_generation'
  | 'multilingual'
  | 'research'
  | 'math';

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
  specializations?: Specialization[];

  // Availability
  available: boolean;
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
  };
  performance: {
    avgLatencyMs: number;
    reliabilityPercent: number;
  };
  available: boolean;
}
