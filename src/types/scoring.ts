import { ModelDefinition } from './models';
import { QueryAnalysis } from './responses';
import { HumanContext, Constraints, ConversationContext } from './requests';

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

// Weights with human context
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
