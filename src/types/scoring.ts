import { ModelDefinition } from './models';
import { QueryAnalysis } from './responses';
import { HumanContext, Constraints, ConversationContext } from './requests';
import { QualityTier } from './enums';

// Individual factor score
export interface FactorScore {
  name: string;
  score: number; // 0-1
  weight: number;
  weightedScore: number;
  detail: string; // Human-readable explanation
}

// Complete scoring result for a model
export interface ModelScore {
  model: ModelDefinition;
  factors: FactorScore[];
  compositeScore: number;
}

// Scoring context passed to scorers
export interface ScoringContext {
  analysis: QueryAnalysis;
  humanContext?: HumanContext;
  constraints?: Constraints;
  conversationContext?: ConversationContext;
  allModels: ModelDefinition[];
  conversationHasImages?: boolean;
  qualityTier?: QualityTier;
}

// Weights configuration
export interface ScoringWeights {
  taskFitness: number;
  specialization: number;
  modalityFitness: number;
  costEfficiency: number;
  userPreference: number;
  conversationCoherence: number;
  speed: number;
  humanContextFit?: number;
}

// Default weights without human context
// Balanced to prevent single-model dominance while prioritizing task fit
export const DEFAULT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.38,        // Primary factor - matches task requirements
  specialization: 0.18,     // Gives specialists a decisive edge in their domain
  modalityFitness: 0.15,
  costEfficiency: 0.08,     // Cost matters but shouldn't override quality signals
  userPreference: 0.08,
  conversationCoherence: 0.06,
  speed: 0.07,              // Speed matters for UX but not at the expense of quality
};

// Weights with human context (used when humanContext is provided and no quality tier override)
export const HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.28,
  specialization: 0.14,
  modalityFitness: 0.12,
  costEfficiency: 0.06,
  userPreference: 0.08,
  conversationCoherence: 0.06,
  speed: 0.06,
  humanContextFit: 0.20,
};

// ── Quality tier weight profiles ──────────────────────────────────────────────
// Each tier shifts the scoring emphasis to match the user's intent.

// Speed: favour low-latency, cost-efficient models
export const SPEED_WEIGHTS: ScoringWeights = {
  taskFitness: 0.20,
  specialization: 0.08,
  modalityFitness: 0.10,
  costEfficiency: 0.25,
  userPreference: 0.03,
  conversationCoherence: 0.04,
  speed: 0.30,
};

// Speed + human context
export const SPEED_HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.16,
  specialization: 0.06,
  modalityFitness: 0.08,
  costEfficiency: 0.20,
  userPreference: 0.03,
  conversationCoherence: 0.03,
  speed: 0.24,
  humanContextFit: 0.20,
};

// Balanced: even distribution — no single factor dominates
export const BALANCED_WEIGHTS: ScoringWeights = {
  taskFitness: 0.24,
  specialization: 0.13,
  modalityFitness: 0.13,
  costEfficiency: 0.14,
  userPreference: 0.06,
  conversationCoherence: 0.06,
  speed: 0.24,
};

// Balanced + human context
export const BALANCED_HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.20,
  specialization: 0.10,
  modalityFitness: 0.10,
  costEfficiency: 0.11,
  userPreference: 0.05,
  conversationCoherence: 0.05,
  speed: 0.19,
  humanContextFit: 0.20,
};

// Quality: favour task fitness and specialisation, deprioritise cost and speed
export const QUALITY_WEIGHTS: ScoringWeights = {
  taskFitness: 0.42,
  specialization: 0.25,
  modalityFitness: 0.15,
  costEfficiency: 0.02,
  userPreference: 0.06,
  conversationCoherence: 0.06,
  speed: 0.04,
};

// Quality + human context
export const QUALITY_HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.32,
  specialization: 0.18,
  modalityFitness: 0.12,
  costEfficiency: 0.02,
  userPreference: 0.04,
  conversationCoherence: 0.04,
  speed: 0.02,
  humanContextFit: 0.26,
};

// Resolve the correct weight profile for a given quality tier and human context state
export function resolveWeights(
  qualityTier: QualityTier | undefined,
  hasHumanContext: boolean
): ScoringWeights {
  switch (qualityTier) {
    case QualityTier.Speed:
      return hasHumanContext ? SPEED_HUMAN_CONTEXT_WEIGHTS : SPEED_WEIGHTS;
    case QualityTier.Balanced:
      return hasHumanContext ? BALANCED_HUMAN_CONTEXT_WEIGHTS : BALANCED_WEIGHTS;
    case QualityTier.Quality:
      return hasHumanContext ? QUALITY_HUMAN_CONTEXT_WEIGHTS : QUALITY_WEIGHTS;
    case QualityTier.Auto:
    default:
      return hasHumanContext ? HUMAN_CONTEXT_WEIGHTS : DEFAULT_WEIGHTS;
  }
}
