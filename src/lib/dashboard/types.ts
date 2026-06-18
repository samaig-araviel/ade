import type { AccessTier } from '@/types';

export interface ModelResult {
  id: string;
  name: string;
  provider: string;
  score: number;
  supportsWebSearch?: boolean;
  reasoning: {
    summary: string;
    factors: Array<{
      name: string;
      score: number;
      weight: number;
      weightedScore: number;
      detail: string;
    }>;
  };
}

export interface RouteResponse {
  decisionId: string;
  primaryModel: ModelResult;
  backupModels: ModelResult[];
  confidence: number;
  webSearchRequired?: boolean;
  analysis: {
    intent: string;
    domain: string;
    complexity: string;
    tone: string;
    modality: string;
    keywords: string[];
    humanContextUsed: boolean;
    webSearchRequired?: boolean;
  };
  timing: {
    totalMs: number;
    analysisMs: number;
    scoringMs: number;
    selectionMs: number;
  };
  upgradeHint?: {
    recommendedModel: { id: string; name: string; provider: string };
    reason: string;
    scoreDifference: number;
  };
}

export interface AnalyzeResult {
  analysis: {
    intent: string;
    domain: string;
    complexity: string;
    tone: string;
    modality: string;
    keywords: string[];
    humanContextUsed: boolean;
  };
  timing: { analysisMs: number };
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  pricing: { inputPer1k: number; outputPer1k: number };
  capabilities: {
    maxInputTokens: number;
    maxOutputTokens: number;
    supportsVision: boolean;
    supportsAudio: boolean;
    supportsStreaming: boolean;
    supportsFunctionCalling: boolean;
    supportsWebSearch?: boolean;
  };
  performance: { avgLatencyMs: number; reliabilityPercent: number };
  accessTier: AccessTier;
}

export interface HumanContext {
  emotionalState?: { mood?: string; energyLevel?: string };
  temporalContext?: { localTime?: string; timezone?: string; dayOfWeek?: string; isWorkingHours?: boolean };
  environmentalContext?: { weather?: string; location?: string };
  preferences?: { preferredResponseStyle?: string; preferredResponseLength?: string; preferredModels?: string[]; avoidModels?: string[] };
  historyHints?: { recentTopics?: string[]; frequentIntents?: string[] };
}

export interface Constraints {
  maxCostPer1kTokens?: number;
  maxLatencyMs?: number;
  allowedModels?: string[];
  excludedModels?: string[];
  requireStreaming?: boolean;
  requireVision?: boolean;
  requireAudio?: boolean;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: { engine: string; store: string };
}

export interface DecisionHistoryEntry {
  id: string;
  prompt: string;
  model: string;
  time: string;
  confidence: number;
}

export interface AnalyzeHistoryEntry {
  prompt: string;
  intent: string;
  domain: string;
  complexity: string;
  time: string;
}

export interface JsonModalState {
  title: string;
  data: unknown;
}
