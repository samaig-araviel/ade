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
  taskFitness: 0.38,        // Primary factor but reduced to allow specialization to differentiate
  specialization: 0.12,     // NEW - gives specialists a clear edge in their domain
  modalityFitness: 0.15,
  costEfficiency: 0.12,     // Slightly increased - cost matters for enterprise
  userPreference: 0.08,
  conversationCoherence: 0.06,
  speed: 0.09,              // Slightly increased - speed matters for UX
};

// Weights with human context
export const HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.32,
  specialization: 0.10,     // NEW
  modalityFitness: 0.12,
  costEfficiency: 0.08,
  userPreference: 0.08,
  conversationCoherence: 0.06,
  speed: 0.07,
  humanContextFit: 0.17,
};
