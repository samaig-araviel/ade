import {
  ModelDefinition,
  ModelInfo,
  Intent,
  Domain,
  Complexity,
} from '@/types';

// Complete model registry with all available models
const models: ModelDefinition[] = [
  // ===== ANTHROPIC MODELS =====
  {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    description: 'Most capable Claude model with exceptional reasoning, analysis, and creative abilities',
    pricing: {
      inputPer1k: 0.015,
      outputPer1k: 0.075,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 32000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.95,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 2500,
      reliabilityPercent: 99.5,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.98,
        [Intent.Creative]: 0.96,
        [Intent.Analysis]: 0.98,
        [Intent.Factual]: 0.95,
        [Intent.Conversation]: 0.94,
        [Intent.Task]: 0.95,
        [Intent.Brainstorm]: 0.97,
        [Intent.Translation]: 0.90,
        [Intent.Summarization]: 0.95,
        [Intent.Extraction]: 0.94,
      },
      domains: {
        [Domain.Technology]: 0.98,
        [Domain.Business]: 0.95,
        [Domain.Health]: 0.92,
        [Domain.Legal]: 0.93,
        [Domain.Finance]: 0.94,
        [Domain.Education]: 0.95,
        [Domain.Science]: 0.96,
        [Domain.CreativeArts]: 0.96,
        [Domain.Lifestyle]: 0.90,
        [Domain.General]: 0.95,
      },
      complexity: {
        [Complexity.Quick]: 0.85,
        [Complexity.Standard]: 0.95,
        [Complexity.Demanding]: 0.98,
      },
    },
    humanFactors: {
      empathyScore: 0.95,
      playfulnessScore: 0.88,
      professionalismScore: 0.98,
      conciseness: 0.75,
      verbosity: 0.90,
      conversationalTone: 0.92,
      formalTone: 0.96,
      lateNightSuitability: 0.85,
      workHoursSuitability: 0.98,
    },
    available: true,
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'Balanced Claude model with strong capabilities at a reasonable cost',
    pricing: {
      inputPer1k: 0.003,
      outputPer1k: 0.015,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 64000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.92,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 1200,
      reliabilityPercent: 99.7,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.95,
        [Intent.Creative]: 0.92,
        [Intent.Analysis]: 0.94,
        [Intent.Factual]: 0.92,
        [Intent.Conversation]: 0.90,
        [Intent.Task]: 0.93,
        [Intent.Brainstorm]: 0.91,
        [Intent.Translation]: 0.88,
        [Intent.Summarization]: 0.92,
        [Intent.Extraction]: 0.91,
      },
      domains: {
        [Domain.Technology]: 0.95,
        [Domain.Business]: 0.92,
        [Domain.Health]: 0.88,
        [Domain.Legal]: 0.89,
        [Domain.Finance]: 0.90,
        [Domain.Education]: 0.92,
        [Domain.Science]: 0.93,
        [Domain.CreativeArts]: 0.91,
        [Domain.Lifestyle]: 0.88,
        [Domain.General]: 0.92,
      },
      complexity: {
        [Complexity.Quick]: 0.90,
        [Complexity.Standard]: 0.94,
        [Complexity.Demanding]: 0.92,
      },
    },
    humanFactors: {
      empathyScore: 0.90,
      playfulnessScore: 0.85,
      professionalismScore: 0.94,
      conciseness: 0.82,
      verbosity: 0.85,
      conversationalTone: 0.90,
      formalTone: 0.92,
      lateNightSuitability: 0.88,
      workHoursSuitability: 0.95,
    },
    available: true,
  },
  {
    id: 'claude-haiku-4-5-20250515',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Fast, efficient Claude model ideal for quick tasks and high-volume use',
    pricing: {
      inputPer1k: 0.0008,
      outputPer1k: 0.004,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.85,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 400,
      reliabilityPercent: 99.8,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.85,
        [Intent.Creative]: 0.80,
        [Intent.Analysis]: 0.82,
        [Intent.Factual]: 0.88,
        [Intent.Conversation]: 0.88,
        [Intent.Task]: 0.90,
        [Intent.Brainstorm]: 0.78,
        [Intent.Translation]: 0.85,
        [Intent.Summarization]: 0.88,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.85,
        [Domain.Business]: 0.85,
        [Domain.Health]: 0.80,
        [Domain.Legal]: 0.78,
        [Domain.Finance]: 0.82,
        [Domain.Education]: 0.88,
        [Domain.Science]: 0.82,
        [Domain.CreativeArts]: 0.78,
        [Domain.Lifestyle]: 0.88,
        [Domain.General]: 0.90,
      },
      complexity: {
        [Complexity.Quick]: 0.95,
        [Complexity.Standard]: 0.85,
        [Complexity.Demanding]: 0.70,
      },
    },
    humanFactors: {
      empathyScore: 0.82,
      playfulnessScore: 0.80,
      professionalismScore: 0.88,
      conciseness: 0.95,
      verbosity: 0.60,
      conversationalTone: 0.88,
      formalTone: 0.85,
      lateNightSuitability: 0.92,
      workHoursSuitability: 0.90,
    },
    available: true,
  },

  // ===== OPENAI MODELS =====
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'Latest GPT-4 series model with enhanced reasoning and coding capabilities',
    pricing: {
      inputPer1k: 0.002,
      outputPer1k: 0.008,
    },
    capabilities: {
      maxInputTokens: 1047576,
      maxOutputTokens: 32768,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.92,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 1500,
      reliabilityPercent: 99.5,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.96,
        [Intent.Creative]: 0.90,
        [Intent.Analysis]: 0.94,
        [Intent.Factual]: 0.93,
        [Intent.Conversation]: 0.88,
        [Intent.Task]: 0.94,
        [Intent.Brainstorm]: 0.88,
        [Intent.Translation]: 0.92,
        [Intent.Summarization]: 0.91,
        [Intent.Extraction]: 0.93,
      },
      domains: {
        [Domain.Technology]: 0.96,
        [Domain.Business]: 0.92,
        [Domain.Health]: 0.88,
        [Domain.Legal]: 0.88,
        [Domain.Finance]: 0.91,
        [Domain.Education]: 0.90,
        [Domain.Science]: 0.92,
        [Domain.CreativeArts]: 0.88,
        [Domain.Lifestyle]: 0.85,
        [Domain.General]: 0.92,
      },
      complexity: {
        [Complexity.Quick]: 0.88,
        [Complexity.Standard]: 0.93,
        [Complexity.Demanding]: 0.95,
      },
    },
    humanFactors: {
      empathyScore: 0.82,
      playfulnessScore: 0.78,
      professionalismScore: 0.94,
      conciseness: 0.80,
      verbosity: 0.85,
      conversationalTone: 0.82,
      formalTone: 0.94,
      lateNightSuitability: 0.80,
      workHoursSuitability: 0.95,
    },
    available: true,
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Efficient version of GPT-4.1 for cost-effective high-volume tasks',
    pricing: {
      inputPer1k: 0.0004,
      outputPer1k: 0.0016,
    },
    capabilities: {
      maxInputTokens: 1047576,
      maxOutputTokens: 32768,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.85,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 600,
      reliabilityPercent: 99.7,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.88,
        [Intent.Creative]: 0.82,
        [Intent.Analysis]: 0.85,
        [Intent.Factual]: 0.88,
        [Intent.Conversation]: 0.85,
        [Intent.Task]: 0.90,
        [Intent.Brainstorm]: 0.80,
        [Intent.Translation]: 0.88,
        [Intent.Summarization]: 0.88,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.88,
        [Domain.Business]: 0.86,
        [Domain.Health]: 0.82,
        [Domain.Legal]: 0.80,
        [Domain.Finance]: 0.84,
        [Domain.Education]: 0.88,
        [Domain.Science]: 0.85,
        [Domain.CreativeArts]: 0.80,
        [Domain.Lifestyle]: 0.85,
        [Domain.General]: 0.88,
      },
      complexity: {
        [Complexity.Quick]: 0.94,
        [Complexity.Standard]: 0.88,
        [Complexity.Demanding]: 0.75,
      },
    },
    humanFactors: {
      empathyScore: 0.78,
      playfulnessScore: 0.75,
      professionalismScore: 0.88,
      conciseness: 0.90,
      verbosity: 0.70,
      conversationalTone: 0.82,
      formalTone: 0.88,
      lateNightSuitability: 0.88,
      workHoursSuitability: 0.90,
    },
    available: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Omni model with native vision and audio capabilities',
    pricing: {
      inputPer1k: 0.0025,
      outputPer1k: 0.01,
    },
    capabilities: {
      maxInputTokens: 128000,
      maxOutputTokens: 16384,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: true,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.94,
      audioScore: 0.92,
    },
    performance: {
      avgLatencyMs: 1000,
      reliabilityPercent: 99.6,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.92,
        [Intent.Creative]: 0.90,
        [Intent.Analysis]: 0.91,
        [Intent.Factual]: 0.92,
        [Intent.Conversation]: 0.93,
        [Intent.Task]: 0.91,
        [Intent.Brainstorm]: 0.88,
        [Intent.Translation]: 0.94,
        [Intent.Summarization]: 0.90,
        [Intent.Extraction]: 0.91,
      },
      domains: {
        [Domain.Technology]: 0.92,
        [Domain.Business]: 0.90,
        [Domain.Health]: 0.86,
        [Domain.Legal]: 0.85,
        [Domain.Finance]: 0.88,
        [Domain.Education]: 0.92,
        [Domain.Science]: 0.90,
        [Domain.CreativeArts]: 0.92,
        [Domain.Lifestyle]: 0.90,
        [Domain.General]: 0.92,
      },
      complexity: {
        [Complexity.Quick]: 0.92,
        [Complexity.Standard]: 0.91,
        [Complexity.Demanding]: 0.88,
      },
    },
    humanFactors: {
      empathyScore: 0.85,
      playfulnessScore: 0.88,
      professionalismScore: 0.90,
      conciseness: 0.82,
      verbosity: 0.82,
      conversationalTone: 0.92,
      formalTone: 0.88,
      lateNightSuitability: 0.88,
      workHoursSuitability: 0.92,
    },
    available: true,
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    provider: 'openai',
    description: 'Reasoning model optimized for complex problem-solving with chain-of-thought',
    pricing: {
      inputPer1k: 0.0011,
      outputPer1k: 0.0044,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 100000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.88,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 3000,
      reliabilityPercent: 99.3,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.94,
        [Intent.Creative]: 0.78,
        [Intent.Analysis]: 0.96,
        [Intent.Factual]: 0.90,
        [Intent.Conversation]: 0.75,
        [Intent.Task]: 0.92,
        [Intent.Brainstorm]: 0.85,
        [Intent.Translation]: 0.82,
        [Intent.Summarization]: 0.85,
        [Intent.Extraction]: 0.88,
      },
      domains: {
        [Domain.Technology]: 0.95,
        [Domain.Business]: 0.88,
        [Domain.Health]: 0.85,
        [Domain.Legal]: 0.90,
        [Domain.Finance]: 0.92,
        [Domain.Education]: 0.88,
        [Domain.Science]: 0.94,
        [Domain.CreativeArts]: 0.75,
        [Domain.Lifestyle]: 0.78,
        [Domain.General]: 0.85,
      },
      complexity: {
        [Complexity.Quick]: 0.70,
        [Complexity.Standard]: 0.85,
        [Complexity.Demanding]: 0.96,
      },
    },
    humanFactors: {
      empathyScore: 0.70,
      playfulnessScore: 0.60,
      professionalismScore: 0.95,
      conciseness: 0.65,
      verbosity: 0.92,
      conversationalTone: 0.68,
      formalTone: 0.95,
      lateNightSuitability: 0.72,
      workHoursSuitability: 0.95,
    },
    available: true,
  },

  // ===== GOOGLE MODELS =====
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'Most capable Gemini model with extended thinking and multimodal excellence',
    pricing: {
      inputPer1k: 0.00125,
      outputPer1k: 0.01,
    },
    capabilities: {
      maxInputTokens: 1048576,
      maxOutputTokens: 65536,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: true,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.96,
      audioScore: 0.94,
    },
    performance: {
      avgLatencyMs: 2000,
      reliabilityPercent: 99.4,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.94,
        [Intent.Creative]: 0.92,
        [Intent.Analysis]: 0.95,
        [Intent.Factual]: 0.94,
        [Intent.Conversation]: 0.90,
        [Intent.Task]: 0.93,
        [Intent.Brainstorm]: 0.91,
        [Intent.Translation]: 0.95,
        [Intent.Summarization]: 0.93,
        [Intent.Extraction]: 0.92,
      },
      domains: {
        [Domain.Technology]: 0.94,
        [Domain.Business]: 0.91,
        [Domain.Health]: 0.90,
        [Domain.Legal]: 0.88,
        [Domain.Finance]: 0.90,
        [Domain.Education]: 0.94,
        [Domain.Science]: 0.95,
        [Domain.CreativeArts]: 0.92,
        [Domain.Lifestyle]: 0.90,
        [Domain.General]: 0.93,
      },
      complexity: {
        [Complexity.Quick]: 0.85,
        [Complexity.Standard]: 0.93,
        [Complexity.Demanding]: 0.95,
      },
    },
    humanFactors: {
      empathyScore: 0.85,
      playfulnessScore: 0.82,
      professionalismScore: 0.92,
      conciseness: 0.78,
      verbosity: 0.88,
      conversationalTone: 0.88,
      formalTone: 0.90,
      lateNightSuitability: 0.85,
      workHoursSuitability: 0.94,
    },
    available: true,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Fast, efficient Gemini model balancing speed and capability',
    pricing: {
      inputPer1k: 0.000075,
      outputPer1k: 0.0003,
    },
    capabilities: {
      maxInputTokens: 1048576,
      maxOutputTokens: 65536,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: true,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.90,
      audioScore: 0.88,
    },
    performance: {
      avgLatencyMs: 500,
      reliabilityPercent: 99.7,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.88,
        [Intent.Creative]: 0.85,
        [Intent.Analysis]: 0.87,
        [Intent.Factual]: 0.90,
        [Intent.Conversation]: 0.88,
        [Intent.Task]: 0.90,
        [Intent.Brainstorm]: 0.82,
        [Intent.Translation]: 0.92,
        [Intent.Summarization]: 0.90,
        [Intent.Extraction]: 0.91,
      },
      domains: {
        [Domain.Technology]: 0.88,
        [Domain.Business]: 0.86,
        [Domain.Health]: 0.84,
        [Domain.Legal]: 0.82,
        [Domain.Finance]: 0.85,
        [Domain.Education]: 0.90,
        [Domain.Science]: 0.88,
        [Domain.CreativeArts]: 0.85,
        [Domain.Lifestyle]: 0.88,
        [Domain.General]: 0.90,
      },
      complexity: {
        [Complexity.Quick]: 0.94,
        [Complexity.Standard]: 0.88,
        [Complexity.Demanding]: 0.80,
      },
    },
    humanFactors: {
      empathyScore: 0.80,
      playfulnessScore: 0.82,
      professionalismScore: 0.88,
      conciseness: 0.90,
      verbosity: 0.72,
      conversationalTone: 0.88,
      formalTone: 0.85,
      lateNightSuitability: 0.90,
      workHoursSuitability: 0.90,
    },
    available: true,
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'google',
    description: 'Lightweight Gemini model for cost-sensitive high-volume applications',
    pricing: {
      inputPer1k: 0.000025,
      outputPer1k: 0.0001,
    },
    capabilities: {
      maxInputTokens: 1048576,
      maxOutputTokens: 65536,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.82,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 300,
      reliabilityPercent: 99.8,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.78,
        [Intent.Creative]: 0.75,
        [Intent.Analysis]: 0.78,
        [Intent.Factual]: 0.85,
        [Intent.Conversation]: 0.85,
        [Intent.Task]: 0.88,
        [Intent.Brainstorm]: 0.72,
        [Intent.Translation]: 0.88,
        [Intent.Summarization]: 0.88,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.78,
        [Domain.Business]: 0.80,
        [Domain.Health]: 0.75,
        [Domain.Legal]: 0.72,
        [Domain.Finance]: 0.78,
        [Domain.Education]: 0.85,
        [Domain.Science]: 0.78,
        [Domain.CreativeArts]: 0.75,
        [Domain.Lifestyle]: 0.85,
        [Domain.General]: 0.88,
      },
      complexity: {
        [Complexity.Quick]: 0.96,
        [Complexity.Standard]: 0.82,
        [Complexity.Demanding]: 0.65,
      },
    },
    humanFactors: {
      empathyScore: 0.75,
      playfulnessScore: 0.78,
      professionalismScore: 0.82,
      conciseness: 0.95,
      verbosity: 0.55,
      conversationalTone: 0.85,
      formalTone: 0.80,
      lateNightSuitability: 0.92,
      workHoursSuitability: 0.85,
    },
    available: true,
  },
];

// Create a Map for O(1) lookup by ID
const modelMap = new Map<string, ModelDefinition>(
  models.map((model) => [model.id, model])
);

// Get all models
export function getAllModels(): ModelDefinition[] {
  return [...models];
}

// Get only available models
export function getAvailableModels(): ModelDefinition[] {
  return models.filter((model) => model.available);
}

// Get a specific model by ID
export function getModelById(id: string): ModelDefinition | undefined {
  return modelMap.get(id);
}

// Get models by provider
export function getModelsByProvider(provider: string): ModelDefinition[] {
  return models.filter((model) => model.provider === provider);
}

// Convert to simplified ModelInfo for API response
export function toModelInfo(model: ModelDefinition): ModelInfo {
  return {
    id: model.id,
    name: model.name,
    provider: model.provider,
    description: model.description,
    pricing: model.pricing,
    capabilities: {
      maxInputTokens: model.capabilities.maxInputTokens,
      maxOutputTokens: model.capabilities.maxOutputTokens,
      supportsStreaming: model.capabilities.supportsStreaming,
      supportsVision: model.capabilities.supportsVision,
      supportsAudio: model.capabilities.supportsAudio,
      supportsFunctionCalling: model.capabilities.supportsFunctionCalling,
      supportsJsonMode: model.capabilities.supportsJsonMode,
    },
    performance: {
      avgLatencyMs: model.performance.avgLatencyMs,
      reliabilityPercent: model.performance.reliabilityPercent,
    },
    available: model.available,
  };
}

// Filter models by constraints
export function filterModelsByConstraints(
  modelList: ModelDefinition[],
  constraints: {
    maxCostPer1kTokens?: number;
    maxLatencyMs?: number;
    allowedModels?: string[];
    excludedModels?: string[];
    requireStreaming?: boolean;
    requireVision?: boolean;
    requireAudio?: boolean;
  }
): ModelDefinition[] {
  return modelList.filter((model) => {
    // Check allowed list
    if (constraints.allowedModels && constraints.allowedModels.length > 0) {
      if (!constraints.allowedModels.includes(model.id)) {
        return false;
      }
    }

    // Check excluded list
    if (constraints.excludedModels && constraints.excludedModels.length > 0) {
      if (constraints.excludedModels.includes(model.id)) {
        return false;
      }
    }

    // Check cost constraint (using average of input and output pricing)
    if (constraints.maxCostPer1kTokens !== undefined) {
      const avgCost = (model.pricing.inputPer1k + model.pricing.outputPer1k) / 2;
      if (avgCost > constraints.maxCostPer1kTokens) {
        return false;
      }
    }

    // Check latency constraint
    if (constraints.maxLatencyMs !== undefined) {
      if (model.performance.avgLatencyMs > constraints.maxLatencyMs) {
        return false;
      }
    }

    // Check streaming requirement
    if (constraints.requireStreaming && !model.capabilities.supportsStreaming) {
      return false;
    }

    // Check vision requirement
    if (constraints.requireVision && !model.capabilities.supportsVision) {
      return false;
    }

    // Check audio requirement
    if (constraints.requireAudio && !model.capabilities.supportsAudio) {
      return false;
    }

    return true;
  });
}

// Get models sorted by a specific modality capability
export function getModelsByModalityCapability(
  modelList: ModelDefinition[],
  modality: 'vision' | 'audio'
): ModelDefinition[] {
  const scoreKey = modality === 'vision' ? 'visionScore' : 'audioScore';
  return [...modelList]
    .filter((m) => m.capabilities[scoreKey] > 0)
    .sort((a, b) => b.capabilities[scoreKey] - a.capabilities[scoreKey]);
}
