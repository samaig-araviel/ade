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
// Task fitness is the primary factor - we want the best model for the job
// Cost and speed are secondary considerations
export const DEFAULT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.50,      // Increased from 0.40 - quality is paramount
  modalityFitness: 0.15,
  costEfficiency: 0.10,   // Reduced from 0.15 - prioritize quality over cost
  userPreference: 0.10,
  conversationCoherence: 0.08,
  speed: 0.07,            // Reduced from 0.10 - prioritize quality over speed
};

// Weights with human context
export const HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.40,      // Increased from 0.32 - quality remains important
  modalityFitness: 0.12,
  costEfficiency: 0.08,   // Reduced - quality first
  userPreference: 0.10,
  conversationCoherence: 0.08,
  speed: 0.07,            // Reduced - quality first
  humanContextFit: 0.15,
};
