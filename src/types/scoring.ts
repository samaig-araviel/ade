import { ModelDefinition } from './models';
import { QueryAnalysis } from './responses';
import { HumanContext, Constraints, ConversationContext } from './requests';
import { RoutingStrategy } from './enums';

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
  strategy?: RoutingStrategy;
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

// ── Weight profiles ───────────────────────────────────────────────────────────
// All profiles sum to 1.0. Each strategy shifts emphasis to match user intent.

// Auto: default balanced routing — task fitness is king, speed is secondary
export const DEFAULT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.38,
  specialization: 0.18,
  modalityFitness: 0.15,
  costEfficiency: 0.08,
  userPreference: 0.08,
  conversationCoherence: 0.06,
  speed: 0.07,
};

// Auto + human context
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

// Speed: fastest capable model — NOT cheapest. Cost is near-irrelevant.
// A Pro user on Speed should get GPT-4o or Gemini Flash, not Flash-Lite.
export const SPEED_WEIGHTS: ScoringWeights = {
  taskFitness: 0.28,
  specialization: 0.10,
  modalityFitness: 0.10,
  costEfficiency: 0.02,
  userPreference: 0.05,
  conversationCoherence: 0.05,
  speed: 0.40,
};

// Speed + human context
export const SPEED_HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.22,
  specialization: 0.08,
  modalityFitness: 0.08,
  costEfficiency: 0.02,
  userPreference: 0.04,
  conversationCoherence: 0.04,
  speed: 0.32,
  humanContextFit: 0.20,
};

// Balanced: even distribution — no single factor dominates
export const BALANCED_WEIGHTS: ScoringWeights = {
  taskFitness: 0.22,
  specialization: 0.14,
  modalityFitness: 0.12,
  costEfficiency: 0.12,
  userPreference: 0.08,
  conversationCoherence: 0.08,
  speed: 0.24,
};

// Balanced + human context
export const BALANCED_HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.18,
  specialization: 0.10,
  modalityFitness: 0.10,
  costEfficiency: 0.10,
  userPreference: 0.06,
  conversationCoherence: 0.06,
  speed: 0.20,
  humanContextFit: 0.20,
};

// Quality: best model for the task — cost and speed are near-irrelevant
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

// ── Weight resolution ─────────────────────────────────────────────────────────

// Resolve the correct weight profile for a given strategy and human context state
export function resolveWeights(
  strategy: RoutingStrategy | undefined,
  hasHumanContext: boolean
): ScoringWeights {
  switch (strategy) {
    case RoutingStrategy.Speed:
      return hasHumanContext ? SPEED_HUMAN_CONTEXT_WEIGHTS : SPEED_WEIGHTS;
    case RoutingStrategy.Balanced:
      return hasHumanContext ? BALANCED_HUMAN_CONTEXT_WEIGHTS : BALANCED_WEIGHTS;
    case RoutingStrategy.Quality:
      return hasHumanContext ? QUALITY_HUMAN_CONTEXT_WEIGHTS : QUALITY_WEIGHTS;
    case RoutingStrategy.Auto:
    default:
      return hasHumanContext ? HUMAN_CONTEXT_WEIGHTS : DEFAULT_WEIGHTS;
  }
}

// ── Web search bonus ──────────────────────────────────────────────────────────

// When the query requires real-time information (webSearchRequired), models that
// support web search receive a significant scoring bonus. This is a correctness
// signal — a model without web search will give stale or wrong answers for
// queries like "what is today's date" or "are we in Easter".
//
// The bonus is large enough to overcome speed/cost advantages of non-search
// models (e.g. Flash-Lite at 300ms vs Flash at 500ms) while being small enough
// not to override task fitness for non-search queries.
export const WEB_SEARCH_BONUS = 0.20;
