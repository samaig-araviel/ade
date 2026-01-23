import {
  Provider,
  Intent,
  Domain,
  Complexity,
  Tone,
  Modality,
  FactorImpact,
} from './enums';

// Factor detail in reasoning
export interface ReasoningFactor {
  name: string;
  impact: FactorImpact;
  weight: number;
  detail: string;
}

// Reasoning for a model recommendation
export interface ModelReasoning {
  summary: string;
  factors: ReasoningFactor[];
}

// Model recommendation with reasoning
export interface ModelRecommendation {
  id: string;
  name: string;
  provider: Provider;
  score: number;
  reasoning: ModelReasoning;
}

// Query analysis result
export interface QueryAnalysis {
  intent: Intent;
  domain: Domain;
  complexity: Complexity;
  tone: Tone;
  modality: Modality;
  keywords: string[];
  humanContextUsed: boolean;
}

// Timing metrics
export interface TimingMetrics {
  totalMs: number;
  analysisMs: number;
  scoringMs: number;
  selectionMs: number;
}

// Main route response
export interface RouteResponse {
  decisionId: string;
  primaryModel: ModelRecommendation;
  backupModels: ModelRecommendation[];
  confidence: number;
  analysis: QueryAnalysis;
  timing: TimingMetrics;
}

// Analyze-only response
export interface AnalyzeResponse {
  analysis: QueryAnalysis;
  timing: {
    analysisMs: number;
  };
}

// Feedback response
export interface FeedbackResponse {
  success: boolean;
  decisionId: string;
  message: string;
}

// Health check response
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    kv: 'connected' | 'disconnected' | 'unknown';
  };
}

// Error response
export interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
}

// Decision storage format
export interface StoredDecision {
  decisionId: string;
  request: {
    prompt: string;
    modality: Modality;
    hasContext: boolean;
    hasHumanContext: boolean;
    hasConstraints: boolean;
  };
  response: RouteResponse;
  timestamp: string;
  feedback?: {
    signal: string;
    comment?: string;
    timestamp: string;
  };
}
