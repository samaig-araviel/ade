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
  modalityFitness: number;
  costEfficiency: number;
  userPreference: number;
  conversationCoherence: number;
  speed: number;
  humanContextFit?: number;
}

// Default weights without human context
export const DEFAULT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.40,
  modalityFitness: 0.15,
  costEfficiency: 0.15,
  userPreference: 0.10,
  conversationCoherence: 0.10,
  speed: 0.10,
};

// Weights with human context
export const HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.32,
  modalityFitness: 0.12,
  costEfficiency: 0.12,
  userPreference: 0.10,
  conversationCoherence: 0.10,
  speed: 0.09,
  humanContextFit: 0.15,
};
