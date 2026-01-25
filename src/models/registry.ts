import {
  ModelDefinition,
  ModelInfo,
  Intent,
  Domain,
  Complexity,
} from '@/types';

// Complete model registry with all available models
// Organized by provider: Anthropic, OpenAI, Google, Perplexity
const models: ModelDefinition[] = [
  // ===== ANTHROPIC CLAUDE MODELS =====

  // Claude Opus 4.5 - Flagship model (Nov 2025)
  {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    description: 'Flagship model with state-of-the-art coding (80.9% SWE-bench), reasoning, and agentic capabilities. 67% cheaper than Opus 4.1.',
    pricing: {
      inputPer1k: 0.005,
      outputPer1k: 0.025,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 64000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsExtendedThinking: true,
      visionScore: 0.96,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 2000,
      reliabilityPercent: 99.5,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.98,
        [Intent.Creative]: 0.96,
        [Intent.Analysis]: 0.98,
        [Intent.Factual]: 0.96,
        [Intent.Conversation]: 0.94,
        [Intent.Task]: 0.97,
        [Intent.Brainstorm]: 0.97,
        [Intent.Translation]: 0.92,
        [Intent.Summarization]: 0.96,
        [Intent.Extraction]: 0.95,
      },
      domains: {
        [Domain.Technology]: 0.98,
        [Domain.Business]: 0.96,
        [Domain.Health]: 0.93,
        [Domain.Legal]: 0.94,
        [Domain.Finance]: 0.95,
        [Domain.Education]: 0.96,
        [Domain.Science]: 0.97,
        [Domain.CreativeArts]: 0.96,
        [Domain.Lifestyle]: 0.91,
        [Domain.General]: 0.96,
      },
      complexity: {
        [Complexity.Quick]: 0.82,
        [Complexity.Standard]: 0.95,
        [Complexity.Demanding]: 0.99,
      },
    },
    humanFactors: {
      empathyScore: 0.96,
      playfulnessScore: 0.90,
      professionalismScore: 0.98,
      conciseness: 0.78,
      verbosity: 0.88,
      conversationalTone: 0.93,
      formalTone: 0.96,
      lateNightSuitability: 0.86,
      workHoursSuitability: 0.98,
    },
    available: true,
  },

  // Claude Sonnet 4.5 - Best for coding & agents (Sep 2025)
  {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    description: 'Best coding model with industry-leading agent capabilities. Supports 1M context in beta. Ideal balance of intelligence, speed, and cost.',
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
      supportsExtendedThinking: true,
      visionScore: 0.94,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 1000,
      reliabilityPercent: 99.7,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.97,
        [Intent.Creative]: 0.93,
        [Intent.Analysis]: 0.95,
        [Intent.Factual]: 0.93,
        [Intent.Conversation]: 0.91,
        [Intent.Task]: 0.95,
        [Intent.Brainstorm]: 0.92,
        [Intent.Translation]: 0.90,
        [Intent.Summarization]: 0.94,
        [Intent.Extraction]: 0.93,
      },
      domains: {
        [Domain.Technology]: 0.97,
        [Domain.Business]: 0.93,
        [Domain.Health]: 0.90,
        [Domain.Legal]: 0.91,
        [Domain.Finance]: 0.92,
        [Domain.Education]: 0.94,
        [Domain.Science]: 0.95,
        [Domain.CreativeArts]: 0.92,
        [Domain.Lifestyle]: 0.89,
        [Domain.General]: 0.94,
      },
      complexity: {
        [Complexity.Quick]: 0.88,
        [Complexity.Standard]: 0.95,
        [Complexity.Demanding]: 0.94,
      },
    },
    humanFactors: {
      empathyScore: 0.92,
      playfulnessScore: 0.87,
      professionalismScore: 0.95,
      conciseness: 0.82,
      verbosity: 0.84,
      conversationalTone: 0.91,
      formalTone: 0.93,
      lateNightSuitability: 0.88,
      workHoursSuitability: 0.96,
    },
    available: true,
  },

  // Claude Haiku 4.5 - Near-frontier fast model (Oct 2025)
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    description: 'Fastest model with near-frontier intelligence. Matches Sonnet 4 on coding, excels at computer-use. 73.3% SWE-bench.',
    pricing: {
      inputPer1k: 0.001,
      outputPer1k: 0.005,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 64000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsExtendedThinking: true,
      visionScore: 0.88,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 350,
      reliabilityPercent: 99.8,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.90,
        [Intent.Creative]: 0.82,
        [Intent.Analysis]: 0.86,
        [Intent.Factual]: 0.90,
        [Intent.Conversation]: 0.90,
        [Intent.Task]: 0.92,
        [Intent.Brainstorm]: 0.80,
        [Intent.Translation]: 0.88,
        [Intent.Summarization]: 0.90,
        [Intent.Extraction]: 0.92,
      },
      domains: {
        [Domain.Technology]: 0.90,
        [Domain.Business]: 0.87,
        [Domain.Health]: 0.82,
        [Domain.Legal]: 0.80,
        [Domain.Finance]: 0.85,
        [Domain.Education]: 0.90,
        [Domain.Science]: 0.86,
        [Domain.CreativeArts]: 0.80,
        [Domain.Lifestyle]: 0.90,
        [Domain.General]: 0.92,
      },
      complexity: {
        [Complexity.Quick]: 0.96,
        [Complexity.Standard]: 0.88,
        [Complexity.Demanding]: 0.78,
      },
    },
    humanFactors: {
      empathyScore: 0.84,
      playfulnessScore: 0.82,
      professionalismScore: 0.90,
      conciseness: 0.94,
      verbosity: 0.62,
      conversationalTone: 0.90,
      formalTone: 0.87,
      lateNightSuitability: 0.94,
      workHoursSuitability: 0.92,
    },
    available: true,
  },

  // Claude Opus 4.1 - Agentic specialist (Aug 2025)
  {
    id: 'claude-opus-4-1-20250805',
    name: 'Claude Opus 4.1',
    provider: 'anthropic',
    description: 'Specialized for agentic tasks, real-world coding, and reasoning. 74.5% SWE-bench. Drop-in upgrade from Opus 4.',
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
      supportsExtendedThinking: true,
      visionScore: 0.94,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 2200,
      reliabilityPercent: 99.5,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.96,
        [Intent.Creative]: 0.94,
        [Intent.Analysis]: 0.97,
        [Intent.Factual]: 0.94,
        [Intent.Conversation]: 0.92,
        [Intent.Task]: 0.96,
        [Intent.Brainstorm]: 0.95,
        [Intent.Translation]: 0.90,
        [Intent.Summarization]: 0.94,
        [Intent.Extraction]: 0.93,
      },
      domains: {
        [Domain.Technology]: 0.96,
        [Domain.Business]: 0.94,
        [Domain.Health]: 0.91,
        [Domain.Legal]: 0.92,
        [Domain.Finance]: 0.93,
        [Domain.Education]: 0.94,
        [Domain.Science]: 0.95,
        [Domain.CreativeArts]: 0.94,
        [Domain.Lifestyle]: 0.89,
        [Domain.General]: 0.94,
      },
      complexity: {
        [Complexity.Quick]: 0.80,
        [Complexity.Standard]: 0.94,
        [Complexity.Demanding]: 0.97,
      },
    },
    humanFactors: {
      empathyScore: 0.94,
      playfulnessScore: 0.88,
      professionalismScore: 0.97,
      conciseness: 0.76,
      verbosity: 0.88,
      conversationalTone: 0.91,
      formalTone: 0.95,
      lateNightSuitability: 0.84,
      workHoursSuitability: 0.97,
    },
    available: true,
  },

  // Claude Opus 4 - Original flagship (May 2025)
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    description: 'Original Claude 4 flagship. Level 3 safety classification. Strong reasoning and coding.',
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
      supportsExtendedThinking: true,
      visionScore: 0.93,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 2400,
      reliabilityPercent: 99.4,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.95,
        [Intent.Creative]: 0.94,
        [Intent.Analysis]: 0.96,
        [Intent.Factual]: 0.93,
        [Intent.Conversation]: 0.91,
        [Intent.Task]: 0.94,
        [Intent.Brainstorm]: 0.94,
        [Intent.Translation]: 0.89,
        [Intent.Summarization]: 0.93,
        [Intent.Extraction]: 0.92,
      },
      domains: {
        [Domain.Technology]: 0.95,
        [Domain.Business]: 0.93,
        [Domain.Health]: 0.90,
        [Domain.Legal]: 0.91,
        [Domain.Finance]: 0.92,
        [Domain.Education]: 0.93,
        [Domain.Science]: 0.94,
        [Domain.CreativeArts]: 0.93,
        [Domain.Lifestyle]: 0.88,
        [Domain.General]: 0.93,
      },
      complexity: {
        [Complexity.Quick]: 0.78,
        [Complexity.Standard]: 0.93,
        [Complexity.Demanding]: 0.96,
      },
    },
    humanFactors: {
      empathyScore: 0.93,
      playfulnessScore: 0.86,
      professionalismScore: 0.96,
      conciseness: 0.74,
      verbosity: 0.90,
      conversationalTone: 0.90,
      formalTone: 0.95,
      lateNightSuitability: 0.83,
      workHoursSuitability: 0.96,
    },
    available: true,
  },

  // Claude Sonnet 4 - Balanced workhorse (May 2025)
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'Balanced model with strong coding and reasoning. Default for most users. Supports 1M context beta.',
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
      supportsExtendedThinking: true,
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

  // Claude Sonnet 3.7 - Step-by-step reasoning (Feb 2025)
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude Sonnet 3.7',
    provider: 'anthropic',
    description: 'Hybrid reasoning model blending fast responses with deeper analysis. Legacy but still performant.',
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
      supportsExtendedThinking: true,
      visionScore: 0.90,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 1400,
      reliabilityPercent: 99.6,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.93,
        [Intent.Creative]: 0.90,
        [Intent.Analysis]: 0.93,
        [Intent.Factual]: 0.91,
        [Intent.Conversation]: 0.89,
        [Intent.Task]: 0.91,
        [Intent.Brainstorm]: 0.89,
        [Intent.Translation]: 0.87,
        [Intent.Summarization]: 0.91,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.93,
        [Domain.Business]: 0.90,
        [Domain.Health]: 0.86,
        [Domain.Legal]: 0.87,
        [Domain.Finance]: 0.88,
        [Domain.Education]: 0.91,
        [Domain.Science]: 0.92,
        [Domain.CreativeArts]: 0.89,
        [Domain.Lifestyle]: 0.87,
        [Domain.General]: 0.91,
      },
      complexity: {
        [Complexity.Quick]: 0.88,
        [Complexity.Standard]: 0.92,
        [Complexity.Demanding]: 0.90,
      },
    },
    humanFactors: {
      empathyScore: 0.88,
      playfulnessScore: 0.84,
      professionalismScore: 0.93,
      conciseness: 0.80,
      verbosity: 0.86,
      conversationalTone: 0.89,
      formalTone: 0.91,
      lateNightSuitability: 0.87,
      workHoursSuitability: 0.94,
    },
    available: true,
  },

  // Claude Haiku 3.5 - Efficient workhorse (Oct 2024)
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude Haiku 3.5',
    provider: 'anthropic',
    description: 'Fast, reliable model for high-volume workloads. Strong content moderation and real-time responses.',
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
      supportsExtendedThinking: false,
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

  // Claude Haiku 3 - Budget option (Mar 2024)
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude Haiku 3',
    provider: 'anthropic',
    description: 'Cheapest Claude model. Best for simple tasks, classification, and ultra-high-volume workloads.',
    pricing: {
      inputPer1k: 0.00025,
      outputPer1k: 0.00125,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsExtendedThinking: false,
      visionScore: 0.78,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 300,
      reliabilityPercent: 99.9,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.75,
        [Intent.Creative]: 0.70,
        [Intent.Analysis]: 0.72,
        [Intent.Factual]: 0.82,
        [Intent.Conversation]: 0.85,
        [Intent.Task]: 0.88,
        [Intent.Brainstorm]: 0.68,
        [Intent.Translation]: 0.80,
        [Intent.Summarization]: 0.85,
        [Intent.Extraction]: 0.88,
      },
      domains: {
        [Domain.Technology]: 0.75,
        [Domain.Business]: 0.78,
        [Domain.Health]: 0.72,
        [Domain.Legal]: 0.68,
        [Domain.Finance]: 0.74,
        [Domain.Education]: 0.82,
        [Domain.Science]: 0.74,
        [Domain.CreativeArts]: 0.68,
        [Domain.Lifestyle]: 0.85,
        [Domain.General]: 0.88,
      },
      complexity: {
        [Complexity.Quick]: 0.98,
        [Complexity.Standard]: 0.78,
        [Complexity.Demanding]: 0.55,
      },
    },
    humanFactors: {
      empathyScore: 0.75,
      playfulnessScore: 0.72,
      professionalismScore: 0.82,
      conciseness: 0.98,
      verbosity: 0.45,
      conversationalTone: 0.85,
      formalTone: 0.80,
      lateNightSuitability: 0.95,
      workHoursSuitability: 0.85,
    },
    available: true,
  },

  // ===== OPENAI MODELS =====

  // GPT-5.2 - Flagship reasoning model
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    description: 'Flagship reasoning model for coding and agentic tasks. Best overall model with configurable reasoning effort.',
    pricing: {
      inputPer1k: 0.00175,
      outputPer1k: 0.014,
    },
    capabilities: {
      maxInputTokens: 400000,
      maxOutputTokens: 128000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.95,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 2000,
      reliabilityPercent: 99.5,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.98,
        [Intent.Creative]: 0.88,
        [Intent.Analysis]: 0.97,
        [Intent.Factual]: 0.94,
        [Intent.Conversation]: 0.85,
        [Intent.Task]: 0.96,
        [Intent.Brainstorm]: 0.90,
        [Intent.Translation]: 0.90,
        [Intent.Summarization]: 0.92,
        [Intent.Extraction]: 0.94,
      },
      domains: {
        [Domain.Technology]: 0.98,
        [Domain.Business]: 0.92,
        [Domain.Health]: 0.88,
        [Domain.Legal]: 0.90,
        [Domain.Finance]: 0.93,
        [Domain.Education]: 0.91,
        [Domain.Science]: 0.96,
        [Domain.CreativeArts]: 0.86,
        [Domain.Lifestyle]: 0.82,
        [Domain.General]: 0.92,
      },
      complexity: {
        [Complexity.Quick]: 0.78,
        [Complexity.Standard]: 0.92,
        [Complexity.Demanding]: 0.98,
      },
    },
    humanFactors: {
      empathyScore: 0.78,
      playfulnessScore: 0.72,
      professionalismScore: 0.96,
      conciseness: 0.70,
      verbosity: 0.88,
      conversationalTone: 0.75,
      formalTone: 0.95,
      lateNightSuitability: 0.75,
      workHoursSuitability: 0.96,
    },
    available: true,
  },

  // GPT-5.2 Pro - Premium reasoning
  {
    id: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    provider: 'openai',
    description: 'Premium version of GPT-5.2 with more compute for harder problems. Best for research and cutting-edge applications.',
    pricing: {
      inputPer1k: 0.021,
      outputPer1k: 0.168,
    },
    capabilities: {
      maxInputTokens: 400000,
      maxOutputTokens: 128000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.96,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 8000,
      reliabilityPercent: 99.3,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.99,
        [Intent.Creative]: 0.90,
        [Intent.Analysis]: 0.99,
        [Intent.Factual]: 0.96,
        [Intent.Conversation]: 0.82,
        [Intent.Task]: 0.97,
        [Intent.Brainstorm]: 0.92,
        [Intent.Translation]: 0.91,
        [Intent.Summarization]: 0.94,
        [Intent.Extraction]: 0.96,
      },
      domains: {
        [Domain.Technology]: 0.99,
        [Domain.Business]: 0.94,
        [Domain.Health]: 0.92,
        [Domain.Legal]: 0.93,
        [Domain.Finance]: 0.95,
        [Domain.Education]: 0.93,
        [Domain.Science]: 0.98,
        [Domain.CreativeArts]: 0.88,
        [Domain.Lifestyle]: 0.84,
        [Domain.General]: 0.94,
      },
      complexity: {
        [Complexity.Quick]: 0.65,
        [Complexity.Standard]: 0.88,
        [Complexity.Demanding]: 0.99,
      },
    },
    humanFactors: {
      empathyScore: 0.76,
      playfulnessScore: 0.68,
      professionalismScore: 0.98,
      conciseness: 0.65,
      verbosity: 0.92,
      conversationalTone: 0.70,
      formalTone: 0.97,
      lateNightSuitability: 0.70,
      workHoursSuitability: 0.96,
    },
    available: true,
  },

  // GPT-5.1
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openai',
    description: 'Previous flagship reasoning model. Superseded by GPT-5.2 but still available.',
    pricing: {
      inputPer1k: 0.00125,
      outputPer1k: 0.01,
    },
    capabilities: {
      maxInputTokens: 400000,
      maxOutputTokens: 128000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.94,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 2200,
      reliabilityPercent: 99.5,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.96,
        [Intent.Creative]: 0.86,
        [Intent.Analysis]: 0.95,
        [Intent.Factual]: 0.92,
        [Intent.Conversation]: 0.84,
        [Intent.Task]: 0.94,
        [Intent.Brainstorm]: 0.88,
        [Intent.Translation]: 0.88,
        [Intent.Summarization]: 0.90,
        [Intent.Extraction]: 0.92,
      },
      domains: {
        [Domain.Technology]: 0.96,
        [Domain.Business]: 0.90,
        [Domain.Health]: 0.86,
        [Domain.Legal]: 0.88,
        [Domain.Finance]: 0.91,
        [Domain.Education]: 0.89,
        [Domain.Science]: 0.94,
        [Domain.CreativeArts]: 0.84,
        [Domain.Lifestyle]: 0.80,
        [Domain.General]: 0.90,
      },
      complexity: {
        [Complexity.Quick]: 0.76,
        [Complexity.Standard]: 0.90,
        [Complexity.Demanding]: 0.96,
      },
    },
    humanFactors: {
      empathyScore: 0.76,
      playfulnessScore: 0.70,
      professionalismScore: 0.94,
      conciseness: 0.72,
      verbosity: 0.86,
      conversationalTone: 0.74,
      formalTone: 0.94,
      lateNightSuitability: 0.74,
      workHoursSuitability: 0.94,
    },
    available: true,
  },

  // GPT-5
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    description: 'Original GPT-5 reasoning model. Superseded by GPT-5.1 and GPT-5.2.',
    pricing: {
      inputPer1k: 0.00125,
      outputPer1k: 0.01,
    },
    capabilities: {
      maxInputTokens: 400000,
      maxOutputTokens: 128000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.92,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 2400,
      reliabilityPercent: 99.4,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.94,
        [Intent.Creative]: 0.84,
        [Intent.Analysis]: 0.93,
        [Intent.Factual]: 0.90,
        [Intent.Conversation]: 0.82,
        [Intent.Task]: 0.92,
        [Intent.Brainstorm]: 0.86,
        [Intent.Translation]: 0.86,
        [Intent.Summarization]: 0.88,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.94,
        [Domain.Business]: 0.88,
        [Domain.Health]: 0.84,
        [Domain.Legal]: 0.86,
        [Domain.Finance]: 0.89,
        [Domain.Education]: 0.87,
        [Domain.Science]: 0.92,
        [Domain.CreativeArts]: 0.82,
        [Domain.Lifestyle]: 0.78,
        [Domain.General]: 0.88,
      },
      complexity: {
        [Complexity.Quick]: 0.74,
        [Complexity.Standard]: 0.88,
        [Complexity.Demanding]: 0.94,
      },
    },
    humanFactors: {
      empathyScore: 0.74,
      playfulnessScore: 0.68,
      professionalismScore: 0.92,
      conciseness: 0.74,
      verbosity: 0.84,
      conversationalTone: 0.72,
      formalTone: 0.92,
      lateNightSuitability: 0.72,
      workHoursSuitability: 0.92,
    },
    available: true,
  },

  // GPT-5 Mini
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    description: 'Fast, affordable reasoning model. Great balance of power and performance for well-defined tasks.',
    pricing: {
      inputPer1k: 0.00025,
      outputPer1k: 0.002,
    },
    capabilities: {
      maxInputTokens: 400000,
      maxOutputTokens: 128000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.88,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 800,
      reliabilityPercent: 99.7,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.90,
        [Intent.Creative]: 0.80,
        [Intent.Analysis]: 0.88,
        [Intent.Factual]: 0.88,
        [Intent.Conversation]: 0.85,
        [Intent.Task]: 0.90,
        [Intent.Brainstorm]: 0.82,
        [Intent.Translation]: 0.86,
        [Intent.Summarization]: 0.88,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.90,
        [Domain.Business]: 0.86,
        [Domain.Health]: 0.82,
        [Domain.Legal]: 0.82,
        [Domain.Finance]: 0.85,
        [Domain.Education]: 0.88,
        [Domain.Science]: 0.88,
        [Domain.CreativeArts]: 0.78,
        [Domain.Lifestyle]: 0.84,
        [Domain.General]: 0.88,
      },
      complexity: {
        [Complexity.Quick]: 0.92,
        [Complexity.Standard]: 0.88,
        [Complexity.Demanding]: 0.82,
      },
    },
    humanFactors: {
      empathyScore: 0.78,
      playfulnessScore: 0.74,
      professionalismScore: 0.90,
      conciseness: 0.85,
      verbosity: 0.75,
      conversationalTone: 0.80,
      formalTone: 0.88,
      lateNightSuitability: 0.85,
      workHoursSuitability: 0.92,
    },
    available: true,
  },

  // GPT-5 Nano
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openai',
    description: 'Fastest, cheapest reasoning model. Excellent for summarization and classification.',
    pricing: {
      inputPer1k: 0.00005,
      outputPer1k: 0.0004,
    },
    capabilities: {
      maxInputTokens: 400000,
      maxOutputTokens: 128000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.82,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 400,
      reliabilityPercent: 99.8,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.80,
        [Intent.Creative]: 0.72,
        [Intent.Analysis]: 0.78,
        [Intent.Factual]: 0.85,
        [Intent.Conversation]: 0.84,
        [Intent.Task]: 0.88,
        [Intent.Brainstorm]: 0.72,
        [Intent.Translation]: 0.82,
        [Intent.Summarization]: 0.90,
        [Intent.Extraction]: 0.92,
      },
      domains: {
        [Domain.Technology]: 0.82,
        [Domain.Business]: 0.80,
        [Domain.Health]: 0.75,
        [Domain.Legal]: 0.74,
        [Domain.Finance]: 0.78,
        [Domain.Education]: 0.85,
        [Domain.Science]: 0.80,
        [Domain.CreativeArts]: 0.70,
        [Domain.Lifestyle]: 0.82,
        [Domain.General]: 0.86,
      },
      complexity: {
        [Complexity.Quick]: 0.96,
        [Complexity.Standard]: 0.82,
        [Complexity.Demanding]: 0.68,
      },
    },
    humanFactors: {
      empathyScore: 0.72,
      playfulnessScore: 0.70,
      professionalismScore: 0.85,
      conciseness: 0.94,
      verbosity: 0.55,
      conversationalTone: 0.82,
      formalTone: 0.82,
      lateNightSuitability: 0.90,
      workHoursSuitability: 0.88,
    },
    available: true,
  },

  // GPT-5.1 Codex
  {
    id: 'gpt-5.1-codex',
    name: 'GPT-5.1 Codex',
    provider: 'openai',
    description: 'Optimized for long-horizon agentic coding tasks. Best for complex code generation and multi-file changes.',
    pricing: {
      inputPer1k: 0.00125,
      outputPer1k: 0.01,
    },
    capabilities: {
      maxInputTokens: 400000,
      maxOutputTokens: 128000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.90,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 2500,
      reliabilityPercent: 99.4,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.99,
        [Intent.Creative]: 0.75,
        [Intent.Analysis]: 0.92,
        [Intent.Factual]: 0.88,
        [Intent.Conversation]: 0.72,
        [Intent.Task]: 0.95,
        [Intent.Brainstorm]: 0.80,
        [Intent.Translation]: 0.78,
        [Intent.Summarization]: 0.85,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.99,
        [Domain.Business]: 0.82,
        [Domain.Health]: 0.75,
        [Domain.Legal]: 0.78,
        [Domain.Finance]: 0.85,
        [Domain.Education]: 0.82,
        [Domain.Science]: 0.90,
        [Domain.CreativeArts]: 0.70,
        [Domain.Lifestyle]: 0.68,
        [Domain.General]: 0.82,
      },
      complexity: {
        [Complexity.Quick]: 0.70,
        [Complexity.Standard]: 0.88,
        [Complexity.Demanding]: 0.98,
      },
    },
    humanFactors: {
      empathyScore: 0.65,
      playfulnessScore: 0.55,
      professionalismScore: 0.95,
      conciseness: 0.70,
      verbosity: 0.85,
      conversationalTone: 0.62,
      formalTone: 0.95,
      lateNightSuitability: 0.78,
      workHoursSuitability: 0.95,
    },
    available: true,
  },

  // GPT-5.1 Codex Mini
  {
    id: 'gpt-5.1-codex-mini',
    name: 'GPT-5.1 Codex Mini',
    provider: 'openai',
    description: 'Fast, cost-efficient coding model for quick edits and smaller code tasks.',
    pricing: {
      inputPer1k: 0.00025,
      outputPer1k: 0.002,
    },
    capabilities: {
      maxInputTokens: 400000,
      maxOutputTokens: 128000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.85,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 600,
      reliabilityPercent: 99.7,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.92,
        [Intent.Creative]: 0.70,
        [Intent.Analysis]: 0.82,
        [Intent.Factual]: 0.82,
        [Intent.Conversation]: 0.70,
        [Intent.Task]: 0.88,
        [Intent.Brainstorm]: 0.72,
        [Intent.Translation]: 0.75,
        [Intent.Summarization]: 0.80,
        [Intent.Extraction]: 0.85,
      },
      domains: {
        [Domain.Technology]: 0.94,
        [Domain.Business]: 0.76,
        [Domain.Health]: 0.70,
        [Domain.Legal]: 0.72,
        [Domain.Finance]: 0.78,
        [Domain.Education]: 0.78,
        [Domain.Science]: 0.84,
        [Domain.CreativeArts]: 0.65,
        [Domain.Lifestyle]: 0.65,
        [Domain.General]: 0.78,
      },
      complexity: {
        [Complexity.Quick]: 0.92,
        [Complexity.Standard]: 0.85,
        [Complexity.Demanding]: 0.78,
      },
    },
    humanFactors: {
      empathyScore: 0.62,
      playfulnessScore: 0.55,
      professionalismScore: 0.90,
      conciseness: 0.88,
      verbosity: 0.65,
      conversationalTone: 0.60,
      formalTone: 0.90,
      lateNightSuitability: 0.85,
      workHoursSuitability: 0.92,
    },
    available: true,
  },

  // GPT-4.1
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    description: 'Smartest non-reasoning model with 1M context window. Excellent instruction following and tool calling.',
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

  // GPT-4.1 Mini
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    description: 'Smaller, faster version of GPT-4.1. Great starting point for most tasks balancing power, performance, and cost.',
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

  // GPT-4.1 Nano
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    description: 'Fastest, most cost-efficient GPT-4.1 model. Best for speed and price optimization.',
    pricing: {
      inputPer1k: 0.0001,
      outputPer1k: 0.0014,
    },
    capabilities: {
      maxInputTokens: 1047576,
      maxOutputTokens: 32768,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.78,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 300,
      reliabilityPercent: 99.8,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.78,
        [Intent.Creative]: 0.72,
        [Intent.Analysis]: 0.75,
        [Intent.Factual]: 0.82,
        [Intent.Conversation]: 0.82,
        [Intent.Task]: 0.85,
        [Intent.Brainstorm]: 0.70,
        [Intent.Translation]: 0.82,
        [Intent.Summarization]: 0.85,
        [Intent.Extraction]: 0.88,
      },
      domains: {
        [Domain.Technology]: 0.78,
        [Domain.Business]: 0.78,
        [Domain.Health]: 0.72,
        [Domain.Legal]: 0.70,
        [Domain.Finance]: 0.75,
        [Domain.Education]: 0.82,
        [Domain.Science]: 0.76,
        [Domain.CreativeArts]: 0.70,
        [Domain.Lifestyle]: 0.80,
        [Domain.General]: 0.84,
      },
      complexity: {
        [Complexity.Quick]: 0.96,
        [Complexity.Standard]: 0.80,
        [Complexity.Demanding]: 0.60,
      },
    },
    humanFactors: {
      empathyScore: 0.72,
      playfulnessScore: 0.70,
      professionalismScore: 0.82,
      conciseness: 0.95,
      verbosity: 0.50,
      conversationalTone: 0.80,
      formalTone: 0.82,
      lateNightSuitability: 0.92,
      workHoursSuitability: 0.85,
    },
    available: true,
  },

  // GPT-4o
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Versatile multimodal model with native audio I/O. Best for applications needing text, image, and audio processing.',
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

  // GPT-4o Mini
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast, affordable multimodal model with audio support. Best budget option for multimodal applications.',
    pricing: {
      inputPer1k: 0.00015,
      outputPer1k: 0.0006,
    },
    capabilities: {
      maxInputTokens: 128000,
      maxOutputTokens: 16384,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: true,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      visionScore: 0.85,
      audioScore: 0.85,
    },
    performance: {
      avgLatencyMs: 500,
      reliabilityPercent: 99.7,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.82,
        [Intent.Creative]: 0.80,
        [Intent.Analysis]: 0.80,
        [Intent.Factual]: 0.85,
        [Intent.Conversation]: 0.88,
        [Intent.Task]: 0.85,
        [Intent.Brainstorm]: 0.78,
        [Intent.Translation]: 0.88,
        [Intent.Summarization]: 0.85,
        [Intent.Extraction]: 0.87,
      },
      domains: {
        [Domain.Technology]: 0.82,
        [Domain.Business]: 0.82,
        [Domain.Health]: 0.78,
        [Domain.Legal]: 0.76,
        [Domain.Finance]: 0.80,
        [Domain.Education]: 0.85,
        [Domain.Science]: 0.82,
        [Domain.CreativeArts]: 0.82,
        [Domain.Lifestyle]: 0.86,
        [Domain.General]: 0.86,
      },
      complexity: {
        [Complexity.Quick]: 0.94,
        [Complexity.Standard]: 0.84,
        [Complexity.Demanding]: 0.72,
      },
    },
    humanFactors: {
      empathyScore: 0.80,
      playfulnessScore: 0.82,
      professionalismScore: 0.85,
      conciseness: 0.88,
      verbosity: 0.70,
      conversationalTone: 0.88,
      formalTone: 0.82,
      lateNightSuitability: 0.90,
      workHoursSuitability: 0.88,
    },
    available: true,
  },

  // o3
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    description: 'Legacy reasoning model for complex tasks. Superseded by GPT-5 but still available.',
    pricing: {
      inputPer1k: 0.002,
      outputPer1k: 0.008,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 100000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.90,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 3000,
      reliabilityPercent: 99.3,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.95,
        [Intent.Creative]: 0.78,
        [Intent.Analysis]: 0.96,
        [Intent.Factual]: 0.90,
        [Intent.Conversation]: 0.75,
        [Intent.Task]: 0.93,
        [Intent.Brainstorm]: 0.85,
        [Intent.Translation]: 0.82,
        [Intent.Summarization]: 0.85,
        [Intent.Extraction]: 0.88,
      },
      domains: {
        [Domain.Technology]: 0.96,
        [Domain.Business]: 0.88,
        [Domain.Health]: 0.85,
        [Domain.Legal]: 0.90,
        [Domain.Finance]: 0.92,
        [Domain.Education]: 0.88,
        [Domain.Science]: 0.95,
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

  // o3 Pro
  {
    id: 'o3-pro',
    name: 'o3 Pro',
    provider: 'openai',
    description: 'Premium reasoning model with more compute. For boundary-pushing research and hardest problems.',
    pricing: {
      inputPer1k: 0.02,
      outputPer1k: 0.08,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 100000,
      supportsStreaming: true,
      supportsVision: true,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsReasoning: true,
      visionScore: 0.92,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 10000,
      reliabilityPercent: 99.2,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.97,
        [Intent.Creative]: 0.80,
        [Intent.Analysis]: 0.98,
        [Intent.Factual]: 0.93,
        [Intent.Conversation]: 0.72,
        [Intent.Task]: 0.95,
        [Intent.Brainstorm]: 0.88,
        [Intent.Translation]: 0.84,
        [Intent.Summarization]: 0.88,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.97,
        [Domain.Business]: 0.90,
        [Domain.Health]: 0.88,
        [Domain.Legal]: 0.92,
        [Domain.Finance]: 0.94,
        [Domain.Education]: 0.90,
        [Domain.Science]: 0.97,
        [Domain.CreativeArts]: 0.78,
        [Domain.Lifestyle]: 0.75,
        [Domain.General]: 0.88,
      },
      complexity: {
        [Complexity.Quick]: 0.55,
        [Complexity.Standard]: 0.80,
        [Complexity.Demanding]: 0.98,
      },
    },
    humanFactors: {
      empathyScore: 0.68,
      playfulnessScore: 0.55,
      professionalismScore: 0.96,
      conciseness: 0.60,
      verbosity: 0.95,
      conversationalTone: 0.62,
      formalTone: 0.96,
      lateNightSuitability: 0.65,
      workHoursSuitability: 0.95,
    },
    available: true,
  },

  // o4-mini
  {
    id: 'o4-mini',
    name: 'o4-mini',
    provider: 'openai',
    description: 'Fast, cost-efficient reasoning model. Superseded by GPT-5 mini but still available.',
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
      supportsReasoning: true,
      visionScore: 0.88,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 1200,
      reliabilityPercent: 99.5,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.92,
        [Intent.Creative]: 0.75,
        [Intent.Analysis]: 0.90,
        [Intent.Factual]: 0.88,
        [Intent.Conversation]: 0.78,
        [Intent.Task]: 0.90,
        [Intent.Brainstorm]: 0.80,
        [Intent.Translation]: 0.82,
        [Intent.Summarization]: 0.85,
        [Intent.Extraction]: 0.88,
      },
      domains: {
        [Domain.Technology]: 0.92,
        [Domain.Business]: 0.85,
        [Domain.Health]: 0.82,
        [Domain.Legal]: 0.85,
        [Domain.Finance]: 0.88,
        [Domain.Education]: 0.85,
        [Domain.Science]: 0.90,
        [Domain.CreativeArts]: 0.72,
        [Domain.Lifestyle]: 0.75,
        [Domain.General]: 0.84,
      },
      complexity: {
        [Complexity.Quick]: 0.82,
        [Complexity.Standard]: 0.88,
        [Complexity.Demanding]: 0.90,
      },
    },
    humanFactors: {
      empathyScore: 0.72,
      playfulnessScore: 0.65,
      professionalismScore: 0.90,
      conciseness: 0.78,
      verbosity: 0.82,
      conversationalTone: 0.72,
      formalTone: 0.90,
      lateNightSuitability: 0.78,
      workHoursSuitability: 0.92,
    },
    available: true,
  },

  // ===== GOOGLE MODELS =====

  // Gemini 2.5 Pro
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'Most capable Gemini model with extended thinking and multimodal excellence.',
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

  // Gemini 2.5 Flash
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Fast, efficient Gemini model balancing speed and capability. Excellent cost-performance ratio.',
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

  // Gemini 2.5 Flash-Lite
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'google',
    description: 'Lightweight Gemini model for cost-sensitive high-volume applications.',
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

  // ===== PERPLEXITY MODELS =====

  // Perplexity Sonar Pro
  {
    id: 'sonar-pro',
    name: 'Perplexity Sonar Pro',
    provider: 'perplexity',
    description: 'Advanced search-augmented model for in-depth research and analysis with web access.',
    pricing: {
      inputPer1k: 0.003,
      outputPer1k: 0.015,
    },
    capabilities: {
      maxInputTokens: 200000,
      maxOutputTokens: 8000,
      supportsStreaming: true,
      supportsVision: false,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsWebSearch: true,
      visionScore: 0,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 3000,
      reliabilityPercent: 99.2,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.80,
        [Intent.Creative]: 0.75,
        [Intent.Analysis]: 0.92,
        [Intent.Factual]: 0.96,
        [Intent.Conversation]: 0.82,
        [Intent.Task]: 0.85,
        [Intent.Brainstorm]: 0.85,
        [Intent.Translation]: 0.80,
        [Intent.Summarization]: 0.92,
        [Intent.Extraction]: 0.90,
      },
      domains: {
        [Domain.Technology]: 0.92,
        [Domain.Business]: 0.90,
        [Domain.Health]: 0.88,
        [Domain.Legal]: 0.85,
        [Domain.Finance]: 0.90,
        [Domain.Education]: 0.92,
        [Domain.Science]: 0.94,
        [Domain.CreativeArts]: 0.78,
        [Domain.Lifestyle]: 0.85,
        [Domain.General]: 0.92,
      },
      complexity: {
        [Complexity.Quick]: 0.78,
        [Complexity.Standard]: 0.90,
        [Complexity.Demanding]: 0.92,
      },
    },
    humanFactors: {
      empathyScore: 0.75,
      playfulnessScore: 0.70,
      professionalismScore: 0.92,
      conciseness: 0.80,
      verbosity: 0.85,
      conversationalTone: 0.78,
      formalTone: 0.90,
      lateNightSuitability: 0.78,
      workHoursSuitability: 0.94,
    },
    available: true,
  },

  // Perplexity Sonar
  {
    id: 'sonar',
    name: 'Perplexity Sonar',
    provider: 'perplexity',
    description: 'Fast search-augmented model for quick research and fact-checking.',
    pricing: {
      inputPer1k: 0.001,
      outputPer1k: 0.001,
    },
    capabilities: {
      maxInputTokens: 128000,
      maxOutputTokens: 8000,
      supportsStreaming: true,
      supportsVision: false,
      supportsAudio: false,
      supportsFunctionCalling: true,
      supportsJsonMode: true,
      supportsWebSearch: true,
      visionScore: 0,
      audioScore: 0,
    },
    performance: {
      avgLatencyMs: 1500,
      reliabilityPercent: 99.5,
    },
    taskStrengths: {
      intents: {
        [Intent.Coding]: 0.72,
        [Intent.Creative]: 0.68,
        [Intent.Analysis]: 0.85,
        [Intent.Factual]: 0.94,
        [Intent.Conversation]: 0.80,
        [Intent.Task]: 0.82,
        [Intent.Brainstorm]: 0.78,
        [Intent.Translation]: 0.75,
        [Intent.Summarization]: 0.88,
        [Intent.Extraction]: 0.85,
      },
      domains: {
        [Domain.Technology]: 0.88,
        [Domain.Business]: 0.86,
        [Domain.Health]: 0.84,
        [Domain.Legal]: 0.82,
        [Domain.Finance]: 0.86,
        [Domain.Education]: 0.88,
        [Domain.Science]: 0.90,
        [Domain.CreativeArts]: 0.72,
        [Domain.Lifestyle]: 0.82,
        [Domain.General]: 0.88,
      },
      complexity: {
        [Complexity.Quick]: 0.92,
        [Complexity.Standard]: 0.85,
        [Complexity.Demanding]: 0.78,
      },
    },
    humanFactors: {
      empathyScore: 0.72,
      playfulnessScore: 0.68,
      professionalismScore: 0.88,
      conciseness: 0.88,
      verbosity: 0.70,
      conversationalTone: 0.78,
      formalTone: 0.85,
      lateNightSuitability: 0.85,
      workHoursSuitability: 0.90,
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

// Get all unique providers
export function getProviders(): string[] {
  return [...new Set(models.map((model) => model.provider))];
}

// Get model count
export function getModelCount(): number {
  return models.length;
}

// Get provider count
export function getProviderCount(): number {
  return getProviders().length;
}

// Paginated model retrieval for lazy loading
export function getModelsPaginated(
  page: number = 1,
  pageSize: number = 10,
  provider?: string
): { models: ModelDefinition[]; total: number; totalPages: number; page: number } {
  let filteredModels = provider
    ? models.filter((m) => m.provider === provider)
    : models;

  const total = filteredModels.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    models: filteredModels.slice(startIndex, endIndex),
    total,
    totalPages,
    page,
  };
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
