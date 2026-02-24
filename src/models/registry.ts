import {
    ModelDefinition,
    ModelInfo,
    Intent,
    Domain,
    Complexity,
    AccessTier,
} from '@/types';

const models: ModelDefinition[] = [
    // ===== ANTHROPIC CLAUDE MODELS =====

    {
        id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'anthropic',
        description: 'Latest flagship model with agent teams, adaptive thinking, and compaction. 1M context window. Released Feb 5, 2026.',
        pricing: { inputPer1k: 0.005, outputPer1k: 0.025 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            supportsExtendedThinking: true,
            visionScore: 0.97, audioScore: 0,
        },
        performance: { avgLatencyMs: 2000, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.96, [Intent.Creative]: 0.97, [Intent.Analysis]: 0.96, [Intent.Factual]: 0.93,
                [Intent.Conversation]: 0.88, [Intent.Task]: 0.95, [Intent.Brainstorm]: 0.95, [Intent.Translation]: 0.87,
                [Intent.Summarization]: 0.94, [Intent.Extraction]: 0.93, [Intent.ImageGeneration]: 0.12,
                [Intent.VideoGeneration]: 0.10, [Intent.VoiceGeneration]: 0.08, [Intent.MusicGeneration]: 0.08,
                [Intent.Research]: 0.88, [Intent.Math]: 0.93, [Intent.Planning]: 0.91,
            },
            domains: {
                [Domain.Technology]: 0.97, [Domain.Business]: 0.93, [Domain.Health]: 0.90, [Domain.Legal]: 0.92,
                [Domain.Finance]: 0.92, [Domain.Education]: 0.94, [Domain.Science]: 0.95, [Domain.CreativeArts]: 0.95,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.93, [Domain.Government]: 0.88, [Domain.Relationships]: 0.80,
                [Domain.Shopping]: 0.75, [Domain.EventPlanning]: 0.80, [Domain.Weather]: 0.72, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.75, [Complexity.Standard]: 0.95, [Complexity.Demanding]: 0.99 },
        },
        humanFactors: {
            empathyScore: 0.96, playfulnessScore: 0.90, professionalismScore: 0.98,
            conciseness: 0.78, verbosity: 0.88, conversationalTone: 0.93,
            formalTone: 0.96, lateNightSuitability: 0.86, workHoursSuitability: 0.98,
        },
        specializations: ['creative_writing', 'reasoning'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'anthropic',
        description: 'Latest Sonnet with near-Opus performance at 1/5 the cost. New default model. 79.6% SWE-bench. Released Feb 17, 2026.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.015 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            supportsExtendedThinking: true,
            visionScore: 0.95, audioScore: 0,
        },
        performance: { avgLatencyMs: 950, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.95, [Intent.Creative]: 0.90, [Intent.Analysis]: 0.93, [Intent.Factual]: 0.91,
                [Intent.Conversation]: 0.89, [Intent.Task]: 0.93, [Intent.Brainstorm]: 0.91, [Intent.Translation]: 0.86,
                [Intent.Summarization]: 0.92, [Intent.Extraction]: 0.91, [Intent.ImageGeneration]: 0.11,
                [Intent.VideoGeneration]: 0.09, [Intent.VoiceGeneration]: 0.07, [Intent.MusicGeneration]: 0.07,
                [Intent.Research]: 0.85, [Intent.Math]: 0.90, [Intent.Planning]: 0.88,
            },
            domains: {
                [Domain.Technology]: 0.95, [Domain.Business]: 0.91, [Domain.Health]: 0.88, [Domain.Legal]: 0.89,
                [Domain.Finance]: 0.90, [Domain.Education]: 0.92, [Domain.Science]: 0.93, [Domain.CreativeArts]: 0.90,
                [Domain.Lifestyle]: 0.84, [Domain.General]: 0.92, [Domain.Government]: 0.85, [Domain.Relationships]: 0.78,
                [Domain.Shopping]: 0.73, [Domain.EventPlanning]: 0.77, [Domain.Weather]: 0.70, [Domain.Sports]: 0.72,
            },
            complexity: { [Complexity.Quick]: 0.88, [Complexity.Standard]: 0.96, [Complexity.Demanding]: 0.93 },
        },
        humanFactors: {
            empathyScore: 0.93, playfulnessScore: 0.88, professionalismScore: 0.96,
            conciseness: 0.83, verbosity: 0.83, conversationalTone: 0.92,
            formalTone: 0.94, lateNightSuitability: 0.89, workHoursSuitability: 0.97,
        },
        specializations: ['coding', 'general_purpose'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', provider: 'anthropic',
        description: 'Flagship model with state-of-the-art coding (80.9% SWE-bench), reasoning, and agentic capabilities.',
        pricing: { inputPer1k: 0.005, outputPer1k: 0.025 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            supportsExtendedThinking: true,
            visionScore: 0.96, audioScore: 0,
        },
        performance: { avgLatencyMs: 2000, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.95, [Intent.Creative]: 0.96, [Intent.Analysis]: 0.95, [Intent.Factual]: 0.92,
                [Intent.Conversation]: 0.87, [Intent.Task]: 0.94, [Intent.Brainstorm]: 0.95, [Intent.Translation]: 0.86,
                [Intent.Summarization]: 0.93, [Intent.Extraction]: 0.92, [Intent.ImageGeneration]: 0.12,
                [Intent.VideoGeneration]: 0.10, [Intent.VoiceGeneration]: 0.08, [Intent.MusicGeneration]: 0.08,
                [Intent.Research]: 0.86, [Intent.Math]: 0.91, [Intent.Planning]: 0.90,
            },
            domains: {
                [Domain.Technology]: 0.96, [Domain.Business]: 0.92, [Domain.Health]: 0.89, [Domain.Legal]: 0.91,
                [Domain.Finance]: 0.91, [Domain.Education]: 0.93, [Domain.Science]: 0.94, [Domain.CreativeArts]: 0.94,
                [Domain.Lifestyle]: 0.81, [Domain.General]: 0.92, [Domain.Government]: 0.87, [Domain.Relationships]: 0.79,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.79, [Domain.Weather]: 0.71, [Domain.Sports]: 0.73,
            },
            complexity: { [Complexity.Quick]: 0.74, [Complexity.Standard]: 0.94, [Complexity.Demanding]: 0.98 },
        },
        humanFactors: {
            empathyScore: 0.96, playfulnessScore: 0.90, professionalismScore: 0.98,
            conciseness: 0.78, verbosity: 0.88, conversationalTone: 0.93,
            formalTone: 0.96, lateNightSuitability: 0.86, workHoursSuitability: 0.98,
        },
        specializations: ['creative_writing', 'reasoning'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', provider: 'anthropic',
        description: 'Best coding model with industry-leading agent capabilities. Ideal balance of intelligence, speed, and cost.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.015 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            supportsExtendedThinking: true,
            visionScore: 0.94, audioScore: 0,
        },
        performance: { avgLatencyMs: 1000, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.94, [Intent.Creative]: 0.88, [Intent.Analysis]: 0.91, [Intent.Factual]: 0.89,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.91, [Intent.Brainstorm]: 0.89, [Intent.Translation]: 0.84,
                [Intent.Summarization]: 0.90, [Intent.Extraction]: 0.89, [Intent.ImageGeneration]: 0.10,
                [Intent.VideoGeneration]: 0.08, [Intent.VoiceGeneration]: 0.06, [Intent.MusicGeneration]: 0.06,
                [Intent.Research]: 0.82, [Intent.Math]: 0.88, [Intent.Planning]: 0.85,
            },
            domains: {
                [Domain.Technology]: 0.94, [Domain.Business]: 0.89, [Domain.Health]: 0.86, [Domain.Legal]: 0.87,
                [Domain.Finance]: 0.88, [Domain.Education]: 0.91, [Domain.Science]: 0.92, [Domain.CreativeArts]: 0.88,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.90, [Domain.Government]: 0.83, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.75, [Domain.Weather]: 0.68, [Domain.Sports]: 0.70,
            },
            complexity: { [Complexity.Quick]: 0.86, [Complexity.Standard]: 0.94, [Complexity.Demanding]: 0.92 },
        },
        humanFactors: {
            empathyScore: 0.92, playfulnessScore: 0.87, professionalismScore: 0.95,
            conciseness: 0.82, verbosity: 0.84, conversationalTone: 0.91,
            formalTone: 0.93, lateNightSuitability: 0.88, workHoursSuitability: 0.96,
        },
        specializations: ['coding'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic',
        description: 'Near-frontier fast model optimized for speed and cost. Ideal for high-volume, quick tasks.',
        pricing: { inputPer1k: 0.0008, outputPer1k: 0.004 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 400, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.82, [Intent.Creative]: 0.78, [Intent.Analysis]: 0.80, [Intent.Factual]: 0.82,
                [Intent.Conversation]: 0.88, [Intent.Task]: 0.80, [Intent.Brainstorm]: 0.77, [Intent.Translation]: 0.78,
                [Intent.Summarization]: 0.82, [Intent.Extraction]: 0.80, [Intent.ImageGeneration]: 0.08,
                [Intent.VideoGeneration]: 0.06, [Intent.VoiceGeneration]: 0.05, [Intent.MusicGeneration]: 0.05,
                [Intent.Research]: 0.72, [Intent.Math]: 0.75, [Intent.Planning]: 0.74,
            },
            domains: {
                [Domain.Technology]: 0.82, [Domain.Business]: 0.78, [Domain.Health]: 0.76, [Domain.Legal]: 0.74,
                [Domain.Finance]: 0.76, [Domain.Education]: 0.80, [Domain.Science]: 0.79, [Domain.CreativeArts]: 0.77,
                [Domain.Lifestyle]: 0.80, [Domain.General]: 0.84, [Domain.Government]: 0.72, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.72, [Domain.Weather]: 0.70, [Domain.Sports]: 0.72,
            },
            complexity: { [Complexity.Quick]: 0.97, [Complexity.Standard]: 0.85, [Complexity.Demanding]: 0.68 },
        },
        humanFactors: {
            empathyScore: 0.85, playfulnessScore: 0.82, professionalismScore: 0.88,
            conciseness: 0.92, verbosity: 0.65, conversationalTone: 0.88,
            formalTone: 0.85, lateNightSuitability: 0.92, workHoursSuitability: 0.90,
        },
        specializations: ['fast_tasks', 'budget'],
        accessTier: AccessTier.Free,
        available: true,
    },

    {
        id: 'claude-3-5-haiku-20241022', name: 'Claude Haiku 3.5', provider: 'anthropic',
        description: 'Budget-friendly Claude model for simple tasks and high-volume classification.',
        pricing: { inputPer1k: 0.0008, outputPer1k: 0.004 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 8192,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.82, audioScore: 0,
        },
        performance: { avgLatencyMs: 350, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.75, [Intent.Creative]: 0.72, [Intent.Analysis]: 0.73, [Intent.Factual]: 0.76,
                [Intent.Conversation]: 0.82, [Intent.Task]: 0.73, [Intent.Brainstorm]: 0.70, [Intent.Translation]: 0.72,
                [Intent.Summarization]: 0.76, [Intent.Extraction]: 0.74, [Intent.ImageGeneration]: 0.06,
                [Intent.VideoGeneration]: 0.05, [Intent.VoiceGeneration]: 0.04, [Intent.MusicGeneration]: 0.04,
                [Intent.Research]: 0.65, [Intent.Math]: 0.68, [Intent.Planning]: 0.66,
            },
            domains: {
                [Domain.Technology]: 0.75, [Domain.Business]: 0.72, [Domain.Health]: 0.70, [Domain.Legal]: 0.68,
                [Domain.Finance]: 0.70, [Domain.Education]: 0.74, [Domain.Science]: 0.73, [Domain.CreativeArts]: 0.72,
                [Domain.Lifestyle]: 0.74, [Domain.General]: 0.78, [Domain.Government]: 0.66, [Domain.Relationships]: 0.70,
                [Domain.Shopping]: 0.70, [Domain.EventPlanning]: 0.66, [Domain.Weather]: 0.66, [Domain.Sports]: 0.68,
            },
            complexity: { [Complexity.Quick]: 0.95, [Complexity.Standard]: 0.78, [Complexity.Demanding]: 0.58 },
        },
        humanFactors: {
            empathyScore: 0.80, playfulnessScore: 0.78, professionalismScore: 0.82,
            conciseness: 0.94, verbosity: 0.55, conversationalTone: 0.85,
            formalTone: 0.80, lateNightSuitability: 0.92, workHoursSuitability: 0.85,
        },
        specializations: ['fast_tasks', 'budget'],
        accessTier: AccessTier.Free,
        available: true,
    },

    // ===== OPENAI MODELS =====

    {
        id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai',
        description: 'Flagship reasoning model for coding and agentic tasks. Configurable reasoning effort.',
        pricing: { inputPer1k: 0.00175, outputPer1k: 0.014, cachedInputPer1k: 0.000175 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.95, audioScore: 0,
        },
        performance: { avgLatencyMs: 2000, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.95, [Intent.Creative]: 0.85, [Intent.Analysis]: 0.96, [Intent.Factual]: 0.93,
                [Intent.Conversation]: 0.82, [Intent.Task]: 0.94, [Intent.Brainstorm]: 0.88, [Intent.Translation]: 0.88,
                [Intent.Summarization]: 0.91, [Intent.Extraction]: 0.93, [Intent.ImageGeneration]: 0.13,
                [Intent.VideoGeneration]: 0.11, [Intent.VoiceGeneration]: 0.09, [Intent.MusicGeneration]: 0.09,
                [Intent.Research]: 0.90, [Intent.Math]: 0.96, [Intent.Planning]: 0.90,
            },
            domains: {
                [Domain.Technology]: 0.96, [Domain.Business]: 0.91, [Domain.Health]: 0.88, [Domain.Legal]: 0.90,
                [Domain.Finance]: 0.93, [Domain.Education]: 0.91, [Domain.Science]: 0.96, [Domain.CreativeArts]: 0.83,
                [Domain.Lifestyle]: 0.80, [Domain.General]: 0.91, [Domain.Government]: 0.90, [Domain.Relationships]: 0.75,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.78, [Domain.Weather]: 0.74, [Domain.Sports]: 0.76,
            },
            complexity: { [Complexity.Quick]: 0.76, [Complexity.Standard]: 0.93, [Complexity.Demanding]: 0.98 },
        },
        humanFactors: {
            empathyScore: 0.88, playfulnessScore: 0.82, professionalismScore: 0.96,
            conciseness: 0.76, verbosity: 0.88, conversationalTone: 0.85,
            formalTone: 0.95, lateNightSuitability: 0.82, workHoursSuitability: 0.96,
        },
        specializations: ['reasoning', 'math'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', provider: 'openai',
        description: 'Premium GPT-5.2 with more compute for harder problems. Best for research and cutting-edge applications.',
        pricing: { inputPer1k: 0.021, outputPer1k: 0.168 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.96, audioScore: 0,
        },
        performance: { avgLatencyMs: 8000, reliabilityPercent: 99.3 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.93, [Intent.Creative]: 0.82, [Intent.Analysis]: 0.97, [Intent.Factual]: 0.94,
                [Intent.Conversation]: 0.78, [Intent.Task]: 0.95, [Intent.Brainstorm]: 0.90, [Intent.Translation]: 0.89,
                [Intent.Summarization]: 0.93, [Intent.Extraction]: 0.95, [Intent.ImageGeneration]: 0.12,
                [Intent.VideoGeneration]: 0.10, [Intent.VoiceGeneration]: 0.08, [Intent.MusicGeneration]: 0.08,
                [Intent.Research]: 0.92, [Intent.Math]: 0.98, [Intent.Planning]: 0.91,
            },
            domains: {
                [Domain.Technology]: 0.97, [Domain.Business]: 0.93, [Domain.Health]: 0.92, [Domain.Legal]: 0.93,
                [Domain.Finance]: 0.95, [Domain.Education]: 0.93, [Domain.Science]: 0.97, [Domain.CreativeArts]: 0.80,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.90, [Domain.Government]: 0.92, [Domain.Relationships]: 0.73,
                [Domain.Shopping]: 0.70, [Domain.EventPlanning]: 0.76, [Domain.Weather]: 0.73, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.62, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.99 },
        },
        humanFactors: {
            empathyScore: 0.82, playfulnessScore: 0.75, professionalismScore: 0.98,
            conciseness: 0.65, verbosity: 0.92, conversationalTone: 0.78,
            formalTone: 0.97, lateNightSuitability: 0.75, workHoursSuitability: 0.96,
        },
        specializations: ['reasoning', 'math'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'gpt-5.1', name: 'GPT-5.1', provider: 'openai',
        description: 'Previous flagship reasoning model. Strong all-rounder superseded by GPT-5.2.',
        pricing: { inputPer1k: 0.00125, outputPer1k: 0.01 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.94, audioScore: 0,
        },
        performance: { avgLatencyMs: 2200, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.93, [Intent.Creative]: 0.84, [Intent.Analysis]: 0.93, [Intent.Factual]: 0.90,
                [Intent.Conversation]: 0.84, [Intent.Task]: 0.92, [Intent.Brainstorm]: 0.87, [Intent.Translation]: 0.87,
                [Intent.Summarization]: 0.89, [Intent.Extraction]: 0.91, [Intent.ImageGeneration]: 0.12,
                [Intent.VideoGeneration]: 0.10, [Intent.VoiceGeneration]: 0.08, [Intent.MusicGeneration]: 0.08,
                [Intent.Research]: 0.84, [Intent.Math]: 0.90, [Intent.Planning]: 0.87,
            },
            domains: {
                [Domain.Technology]: 0.94, [Domain.Business]: 0.89, [Domain.Health]: 0.86, [Domain.Legal]: 0.88,
                [Domain.Finance]: 0.91, [Domain.Education]: 0.89, [Domain.Science]: 0.93, [Domain.CreativeArts]: 0.82,
                [Domain.Lifestyle]: 0.79, [Domain.General]: 0.89, [Domain.Government]: 0.86, [Domain.Relationships]: 0.77,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.77, [Domain.Weather]: 0.71, [Domain.Sports]: 0.73,
            },
            complexity: { [Complexity.Quick]: 0.76, [Complexity.Standard]: 0.90, [Complexity.Demanding]: 0.96 },
        },
        humanFactors: {
            empathyScore: 0.85, playfulnessScore: 0.80, professionalismScore: 0.94,
            conciseness: 0.76, verbosity: 0.86, conversationalTone: 0.83,
            formalTone: 0.94, lateNightSuitability: 0.80, workHoursSuitability: 0.94,
        },
        specializations: ['general_purpose', 'coding'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'gpt-5', name: 'GPT-5', provider: 'openai',
        description: 'Original GPT-5 reasoning model. Superseded by GPT-5.1 and GPT-5.2.',
        pricing: { inputPer1k: 0.00125, outputPer1k: 0.01 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.92, audioScore: 0,
        },
        performance: { avgLatencyMs: 2400, reliabilityPercent: 99.4 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.90, [Intent.Creative]: 0.82, [Intent.Analysis]: 0.90, [Intent.Factual]: 0.88,
                [Intent.Conversation]: 0.85, [Intent.Task]: 0.90, [Intent.Brainstorm]: 0.85, [Intent.Translation]: 0.84,
                [Intent.Summarization]: 0.87, [Intent.Extraction]: 0.89, [Intent.ImageGeneration]: 0.12,
                [Intent.VideoGeneration]: 0.10, [Intent.VoiceGeneration]: 0.08, [Intent.MusicGeneration]: 0.08,
                [Intent.Research]: 0.82, [Intent.Math]: 0.86, [Intent.Planning]: 0.87,
            },
            domains: {
                [Domain.Technology]: 0.91, [Domain.Business]: 0.87, [Domain.Health]: 0.84, [Domain.Legal]: 0.86,
                [Domain.Finance]: 0.88, [Domain.Education]: 0.87, [Domain.Science]: 0.90, [Domain.CreativeArts]: 0.82,
                [Domain.Lifestyle]: 0.80, [Domain.General]: 0.88, [Domain.Government]: 0.84, [Domain.Relationships]: 0.80,
                [Domain.Shopping]: 0.77, [Domain.EventPlanning]: 0.80, [Domain.Weather]: 0.74, [Domain.Sports]: 0.76,
            },
            complexity: { [Complexity.Quick]: 0.74, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.94 },
        },
        humanFactors: {
            empathyScore: 0.84, playfulnessScore: 0.78, professionalismScore: 0.92,
            conciseness: 0.76, verbosity: 0.84, conversationalTone: 0.82,
            formalTone: 0.92, lateNightSuitability: 0.78, workHoursSuitability: 0.92,
        },
        specializations: ['general_purpose'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai',
        description: 'Fast, affordable reasoning model. Great balance of power and performance.',
        pricing: { inputPer1k: 0.00025, outputPer1k: 0.002 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 800, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.84, [Intent.Creative]: 0.78, [Intent.Analysis]: 0.83, [Intent.Factual]: 0.85,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.84, [Intent.Brainstorm]: 0.78, [Intent.Translation]: 0.82,
                [Intent.Summarization]: 0.85, [Intent.Extraction]: 0.86, [Intent.ImageGeneration]: 0.09,
                [Intent.VideoGeneration]: 0.07, [Intent.VoiceGeneration]: 0.06, [Intent.MusicGeneration]: 0.06,
                [Intent.Research]: 0.74, [Intent.Math]: 0.78, [Intent.Planning]: 0.78,
            },
            domains: {
                [Domain.Technology]: 0.85, [Domain.Business]: 0.82, [Domain.Health]: 0.79, [Domain.Legal]: 0.78,
                [Domain.Finance]: 0.82, [Domain.Education]: 0.84, [Domain.Science]: 0.83, [Domain.CreativeArts]: 0.77,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.86, [Domain.Government]: 0.74, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.75, [Domain.EventPlanning]: 0.74, [Domain.Weather]: 0.72, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.92, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.78 },
        },
        humanFactors: {
            empathyScore: 0.84, playfulnessScore: 0.80, professionalismScore: 0.90,
            conciseness: 0.87, verbosity: 0.75, conversationalTone: 0.85,
            formalTone: 0.88, lateNightSuitability: 0.87, workHoursSuitability: 0.92,
        },
        specializations: ['fast_tasks', 'general_purpose'],
        accessTier: AccessTier.Free,
        available: true,
    },

    {
        id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai',
        description: 'Fastest, cheapest reasoning model. Excellent for summarization and classification.',
        pricing: { inputPer1k: 0.00005, outputPer1k: 0.0004 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.82, audioScore: 0,
        },
        performance: { avgLatencyMs: 400, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.72, [Intent.Creative]: 0.68, [Intent.Analysis]: 0.73, [Intent.Factual]: 0.78,
                [Intent.Conversation]: 0.80, [Intent.Task]: 0.76, [Intent.Brainstorm]: 0.66, [Intent.Translation]: 0.75,
                [Intent.Summarization]: 0.82, [Intent.Extraction]: 0.84, [Intent.ImageGeneration]: 0.06,
                [Intent.VideoGeneration]: 0.05, [Intent.VoiceGeneration]: 0.04, [Intent.MusicGeneration]: 0.04,
                [Intent.Research]: 0.62, [Intent.Math]: 0.65, [Intent.Planning]: 0.63,
            },
            domains: {
                [Domain.Technology]: 0.74, [Domain.Business]: 0.72, [Domain.Health]: 0.70, [Domain.Legal]: 0.68,
                [Domain.Finance]: 0.72, [Domain.Education]: 0.76, [Domain.Science]: 0.73, [Domain.CreativeArts]: 0.66,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.80, [Domain.Government]: 0.63, [Domain.Relationships]: 0.68,
                [Domain.Shopping]: 0.70, [Domain.EventPlanning]: 0.63, [Domain.Weather]: 0.65, [Domain.Sports]: 0.66,
            },
            complexity: { [Complexity.Quick]: 0.97, [Complexity.Standard]: 0.80, [Complexity.Demanding]: 0.62 },
        },
        humanFactors: {
            empathyScore: 0.72, playfulnessScore: 0.70, professionalismScore: 0.85,
            conciseness: 0.94, verbosity: 0.55, conversationalTone: 0.82,
            formalTone: 0.82, lateNightSuitability: 0.90, workHoursSuitability: 0.88,
        },
        specializations: ['fast_tasks', 'budget'],
        accessTier: AccessTier.Free,
        available: true,
    },

    {
        id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex', provider: 'openai',
        description: 'Optimized for long-horizon agentic coding tasks. Best for complex code generation and multi-file changes.',
        pricing: { inputPer1k: 0.00125, outputPer1k: 0.01 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.90, audioScore: 0,
        },
        performance: { avgLatencyMs: 2500, reliabilityPercent: 99.4 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.99, [Intent.Creative]: 0.55, [Intent.Analysis]: 0.82, [Intent.Factual]: 0.72,
                [Intent.Conversation]: 0.50, [Intent.Task]: 0.85, [Intent.Brainstorm]: 0.65, [Intent.Translation]: 0.60,
                [Intent.Summarization]: 0.72, [Intent.Extraction]: 0.82, [Intent.ImageGeneration]: 0.08,
                [Intent.VideoGeneration]: 0.06, [Intent.VoiceGeneration]: 0.04, [Intent.MusicGeneration]: 0.04,
                [Intent.Research]: 0.60, [Intent.Math]: 0.88, [Intent.Planning]: 0.70,
            },
            domains: {
                [Domain.Technology]: 0.99, [Domain.Business]: 0.65, [Domain.Health]: 0.55, [Domain.Legal]: 0.55,
                [Domain.Finance]: 0.62, [Domain.Education]: 0.70, [Domain.Science]: 0.82, [Domain.CreativeArts]: 0.45,
                [Domain.Lifestyle]: 0.40, [Domain.General]: 0.65, [Domain.Government]: 0.50, [Domain.Relationships]: 0.35,
                [Domain.Shopping]: 0.35, [Domain.EventPlanning]: 0.40, [Domain.Weather]: 0.35, [Domain.Sports]: 0.35,
            },
            complexity: { [Complexity.Quick]: 0.70, [Complexity.Standard]: 0.90, [Complexity.Demanding]: 0.98 },
        },
        humanFactors: {
            empathyScore: 0.75, playfulnessScore: 0.65, professionalismScore: 0.95,
            conciseness: 0.72, verbosity: 0.85, conversationalTone: 0.72,
            formalTone: 0.95, lateNightSuitability: 0.80, workHoursSuitability: 0.95,
        },
        specializations: ['coding'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', provider: 'openai',
        description: 'Fast, cost-efficient coding model for quick edits and smaller code tasks.',
        pricing: { inputPer1k: 0.00025, outputPer1k: 0.002 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.85, audioScore: 0,
        },
        performance: { avgLatencyMs: 600, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.92, [Intent.Creative]: 0.50, [Intent.Analysis]: 0.72, [Intent.Factual]: 0.68,
                [Intent.Conversation]: 0.48, [Intent.Task]: 0.78, [Intent.Brainstorm]: 0.58, [Intent.Translation]: 0.55,
                [Intent.Summarization]: 0.68, [Intent.Extraction]: 0.75, [Intent.ImageGeneration]: 0.06,
                [Intent.VideoGeneration]: 0.05, [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.52, [Intent.Math]: 0.82, [Intent.Planning]: 0.62,
            },
            domains: {
                [Domain.Technology]: 0.94, [Domain.Business]: 0.58, [Domain.Health]: 0.48, [Domain.Legal]: 0.48,
                [Domain.Finance]: 0.55, [Domain.Education]: 0.62, [Domain.Science]: 0.75, [Domain.CreativeArts]: 0.40,
                [Domain.Lifestyle]: 0.38, [Domain.General]: 0.58, [Domain.Government]: 0.44, [Domain.Relationships]: 0.32,
                [Domain.Shopping]: 0.32, [Domain.EventPlanning]: 0.35, [Domain.Weather]: 0.32, [Domain.Sports]: 0.32,
            },
            complexity: { [Complexity.Quick]: 0.92, [Complexity.Standard]: 0.85, [Complexity.Demanding]: 0.78 },
        },
        humanFactors: {
            empathyScore: 0.72, playfulnessScore: 0.65, professionalismScore: 0.90,
            conciseness: 0.88, verbosity: 0.65, conversationalTone: 0.70,
            formalTone: 0.90, lateNightSuitability: 0.86, workHoursSuitability: 0.92,
        },
        specializations: ['coding', 'fast_tasks'],
        accessTier: AccessTier.Free,
        available: true,
    },

    {
        id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai',
        description: 'Smartest non-reasoning model with 1M context window. Excellent instruction following.',
        pricing: { inputPer1k: 0.002, outputPer1k: 0.008 },
        capabilities: {
            maxInputTokens: 1047576, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.92, audioScore: 0,
        },
        performance: { avgLatencyMs: 1500, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.89, [Intent.Creative]: 0.85, [Intent.Analysis]: 0.89, [Intent.Factual]: 0.88,
                [Intent.Conversation]: 0.88, [Intent.Task]: 0.89, [Intent.Brainstorm]: 0.87, [Intent.Translation]: 0.84,
                [Intent.Summarization]: 0.89, [Intent.Extraction]: 0.88, [Intent.ImageGeneration]: 0.11,
                [Intent.VideoGeneration]: 0.09, [Intent.VoiceGeneration]: 0.07, [Intent.MusicGeneration]: 0.07,
                [Intent.Research]: 0.80, [Intent.Math]: 0.84, [Intent.Planning]: 0.85,
            },
            domains: {
                [Domain.Technology]: 0.90, [Domain.Business]: 0.88, [Domain.Health]: 0.85, [Domain.Legal]: 0.86,
                [Domain.Finance]: 0.87, [Domain.Education]: 0.89, [Domain.Science]: 0.89, [Domain.CreativeArts]: 0.85,
                [Domain.Lifestyle]: 0.83, [Domain.General]: 0.90, [Domain.Government]: 0.83, [Domain.Relationships]: 0.78,
                [Domain.Shopping]: 0.76, [Domain.EventPlanning]: 0.78, [Domain.Weather]: 0.73, [Domain.Sports]: 0.75,
            },
            complexity: { [Complexity.Quick]: 0.85, [Complexity.Standard]: 0.92, [Complexity.Demanding]: 0.92 },
        },
        humanFactors: {
            empathyScore: 0.88, playfulnessScore: 0.84, professionalismScore: 0.94,
            conciseness: 0.82, verbosity: 0.85, conversationalTone: 0.88,
            formalTone: 0.94, lateNightSuitability: 0.84, workHoursSuitability: 0.95,
        },
        specializations: ['general_purpose'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai',
        description: 'Fast version of GPT-4.1. Great starting point for most tasks.',
        pricing: { inputPer1k: 0.0004, outputPer1k: 0.0016 },
        capabilities: {
            maxInputTokens: 1047576, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.85, audioScore: 0,
        },
        performance: { avgLatencyMs: 600, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.82, [Intent.Creative]: 0.78, [Intent.Analysis]: 0.80, [Intent.Factual]: 0.83,
                [Intent.Conversation]: 0.85, [Intent.Task]: 0.82, [Intent.Brainstorm]: 0.76, [Intent.Translation]: 0.80,
                [Intent.Summarization]: 0.83, [Intent.Extraction]: 0.82, [Intent.ImageGeneration]: 0.08,
                [Intent.VideoGeneration]: 0.06, [Intent.VoiceGeneration]: 0.05, [Intent.MusicGeneration]: 0.05,
                [Intent.Research]: 0.72, [Intent.Math]: 0.76, [Intent.Planning]: 0.76,
            },
            domains: {
                [Domain.Technology]: 0.83, [Domain.Business]: 0.80, [Domain.Health]: 0.78, [Domain.Legal]: 0.76,
                [Domain.Finance]: 0.79, [Domain.Education]: 0.83, [Domain.Science]: 0.81, [Domain.CreativeArts]: 0.78,
                [Domain.Lifestyle]: 0.81, [Domain.General]: 0.85, [Domain.Government]: 0.72, [Domain.Relationships]: 0.74,
                [Domain.Shopping]: 0.73, [Domain.EventPlanning]: 0.72, [Domain.Weather]: 0.70, [Domain.Sports]: 0.72,
            },
            complexity: { [Complexity.Quick]: 0.94, [Complexity.Standard]: 0.87, [Complexity.Demanding]: 0.72 },
        },
        humanFactors: {
            empathyScore: 0.84, playfulnessScore: 0.80, professionalismScore: 0.88,
            conciseness: 0.90, verbosity: 0.70, conversationalTone: 0.86,
            formalTone: 0.88, lateNightSuitability: 0.88, workHoursSuitability: 0.90,
        },
        specializations: ['fast_tasks', 'general_purpose'],
        accessTier: AccessTier.Free,
        available: true,
    },

    {
        id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'openai',
        description: 'Fastest, most cost-efficient GPT-4.1 model for speed and price optimization.',
        pricing: { inputPer1k: 0.0001, outputPer1k: 0.0014 },
        capabilities: {
            maxInputTokens: 1047576, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.78, audioScore: 0,
        },
        performance: { avgLatencyMs: 300, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.70, [Intent.Creative]: 0.65, [Intent.Analysis]: 0.68, [Intent.Factual]: 0.74,
                [Intent.Conversation]: 0.78, [Intent.Task]: 0.72, [Intent.Brainstorm]: 0.63, [Intent.Translation]: 0.72,
                [Intent.Summarization]: 0.78, [Intent.Extraction]: 0.80, [Intent.ImageGeneration]: 0.05,
                [Intent.VideoGeneration]: 0.04, [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.58, [Intent.Math]: 0.62, [Intent.Planning]: 0.60,
            },
            domains: {
                [Domain.Technology]: 0.72, [Domain.Business]: 0.70, [Domain.Health]: 0.67, [Domain.Legal]: 0.65,
                [Domain.Finance]: 0.68, [Domain.Education]: 0.73, [Domain.Science]: 0.70, [Domain.CreativeArts]: 0.64,
                [Domain.Lifestyle]: 0.74, [Domain.General]: 0.78, [Domain.Government]: 0.60, [Domain.Relationships]: 0.66,
                [Domain.Shopping]: 0.68, [Domain.EventPlanning]: 0.60, [Domain.Weather]: 0.63, [Domain.Sports]: 0.64,
            },
            complexity: { [Complexity.Quick]: 0.96, [Complexity.Standard]: 0.78, [Complexity.Demanding]: 0.55 },
        },
        humanFactors: {
            empathyScore: 0.72, playfulnessScore: 0.70, professionalismScore: 0.82,
            conciseness: 0.95, verbosity: 0.50, conversationalTone: 0.80,
            formalTone: 0.82, lateNightSuitability: 0.92, workHoursSuitability: 0.85,
        },
        specializations: ['fast_tasks', 'budget'],
        accessTier: AccessTier.Free,
        available: true,
    },

    {
        id: 'gpt-4o', name: 'GPT-4o', provider: 'openai',
        description: 'Versatile multimodal model with native audio I/O. Best for text, image, and audio processing.',
        pricing: { inputPer1k: 0.0025, outputPer1k: 0.01 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 16384,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.94, audioScore: 0.92,
        },
        performance: { avgLatencyMs: 1000, reliabilityPercent: 99.6 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.86, [Intent.Creative]: 0.92, [Intent.Analysis]: 0.88, [Intent.Factual]: 0.87,
                [Intent.Conversation]: 0.93, [Intent.Task]: 0.87, [Intent.Brainstorm]: 0.90, [Intent.Translation]: 0.90,
                [Intent.Summarization]: 0.88, [Intent.Extraction]: 0.86, [Intent.ImageGeneration]: 0.15,
                [Intent.VideoGeneration]: 0.12, [Intent.VoiceGeneration]: 0.10, [Intent.MusicGeneration]: 0.10,
                [Intent.Research]: 0.80, [Intent.Math]: 0.82, [Intent.Planning]: 0.85,
            },
            domains: {
                [Domain.Technology]: 0.88, [Domain.Business]: 0.86, [Domain.Health]: 0.84, [Domain.Legal]: 0.83,
                [Domain.Finance]: 0.85, [Domain.Education]: 0.89, [Domain.Science]: 0.87, [Domain.CreativeArts]: 0.91,
                [Domain.Lifestyle]: 0.88, [Domain.General]: 0.92, [Domain.Government]: 0.80, [Domain.Relationships]: 0.85,
                [Domain.Shopping]: 0.82, [Domain.EventPlanning]: 0.83, [Domain.Weather]: 0.78, [Domain.Sports]: 0.80,
            },
            complexity: { [Complexity.Quick]: 0.90, [Complexity.Standard]: 0.90, [Complexity.Demanding]: 0.85 },
        },
        humanFactors: {
            empathyScore: 0.85, playfulnessScore: 0.88, professionalismScore: 0.90,
            conciseness: 0.82, verbosity: 0.82, conversationalTone: 0.92,
            formalTone: 0.88, lateNightSuitability: 0.88, workHoursSuitability: 0.92,
        },
        specializations: ['multimodal', 'creative_writing'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai',
        description: 'Fast, affordable multimodal model with audio support.',
        pricing: { inputPer1k: 0.00015, outputPer1k: 0.0006 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 16384,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.85, audioScore: 0.85,
        },
        performance: { avgLatencyMs: 500, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.78, [Intent.Creative]: 0.80, [Intent.Analysis]: 0.76, [Intent.Factual]: 0.80,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.78, [Intent.Brainstorm]: 0.76, [Intent.Translation]: 0.82,
                [Intent.Summarization]: 0.80, [Intent.Extraction]: 0.78, [Intent.ImageGeneration]: 0.10,
                [Intent.VideoGeneration]: 0.08, [Intent.VoiceGeneration]: 0.07, [Intent.MusicGeneration]: 0.07,
                [Intent.Research]: 0.68, [Intent.Math]: 0.72, [Intent.Planning]: 0.72,
            },
            domains: {
                [Domain.Technology]: 0.78, [Domain.Business]: 0.76, [Domain.Health]: 0.74, [Domain.Legal]: 0.72,
                [Domain.Finance]: 0.75, [Domain.Education]: 0.80, [Domain.Science]: 0.77, [Domain.CreativeArts]: 0.80,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.84, [Domain.Government]: 0.68, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.76, [Domain.EventPlanning]: 0.72, [Domain.Weather]: 0.72, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.94, [Complexity.Standard]: 0.83, [Complexity.Demanding]: 0.68 },
        },
        humanFactors: {
            empathyScore: 0.84, playfulnessScore: 0.84, professionalismScore: 0.85,
            conciseness: 0.88, verbosity: 0.70, conversationalTone: 0.90,
            formalTone: 0.82, lateNightSuitability: 0.90, workHoursSuitability: 0.88,
        },
        specializations: ['fast_tasks', 'multimodal'],
        accessTier: AccessTier.Free,
        available: true,
    },

    {
        id: 'o3', name: 'o3', provider: 'openai',
        description: 'Reasoning model for complex analytical tasks. Excels at math and science.',
        pricing: { inputPer1k: 0.002, outputPer1k: 0.008 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 100000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.90, audioScore: 0,
        },
        performance: { avgLatencyMs: 3000, reliabilityPercent: 99.3 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.92, [Intent.Creative]: 0.75, [Intent.Analysis]: 0.95, [Intent.Factual]: 0.89,
                [Intent.Conversation]: 0.72, [Intent.Task]: 0.90, [Intent.Brainstorm]: 0.82, [Intent.Translation]: 0.80,
                [Intent.Summarization]: 0.84, [Intent.Extraction]: 0.87, [Intent.ImageGeneration]: 0.10,
                [Intent.VideoGeneration]: 0.08, [Intent.VoiceGeneration]: 0.06, [Intent.MusicGeneration]: 0.06,
                [Intent.Research]: 0.88, [Intent.Math]: 0.97, [Intent.Planning]: 0.85,
            },
            domains: {
                [Domain.Technology]: 0.94, [Domain.Business]: 0.87, [Domain.Health]: 0.85, [Domain.Legal]: 0.90,
                [Domain.Finance]: 0.92, [Domain.Education]: 0.88, [Domain.Science]: 0.95, [Domain.CreativeArts]: 0.72,
                [Domain.Lifestyle]: 0.72, [Domain.General]: 0.84, [Domain.Government]: 0.88, [Domain.Relationships]: 0.68,
                [Domain.Shopping]: 0.65, [Domain.EventPlanning]: 0.70, [Domain.Weather]: 0.68, [Domain.Sports]: 0.70,
            },
            complexity: { [Complexity.Quick]: 0.68, [Complexity.Standard]: 0.86, [Complexity.Demanding]: 0.96 },
        },
        humanFactors: {
            empathyScore: 0.80, playfulnessScore: 0.72, professionalismScore: 0.95,
            conciseness: 0.70, verbosity: 0.92, conversationalTone: 0.78,
            formalTone: 0.95, lateNightSuitability: 0.78, workHoursSuitability: 0.95,
        },
        specializations: ['reasoning', 'math'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'o3-pro', name: 'o3 Pro', provider: 'openai',
        description: 'Premium reasoning model with more compute. For the hardest research problems.',
        pricing: { inputPer1k: 0.02, outputPer1k: 0.08 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 100000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.92, audioScore: 0,
        },
        performance: { avgLatencyMs: 10000, reliabilityPercent: 99.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.90, [Intent.Creative]: 0.72, [Intent.Analysis]: 0.97, [Intent.Factual]: 0.92,
                [Intent.Conversation]: 0.68, [Intent.Task]: 0.88, [Intent.Brainstorm]: 0.84, [Intent.Translation]: 0.82,
                [Intent.Summarization]: 0.87, [Intent.Extraction]: 0.90, [Intent.ImageGeneration]: 0.10,
                [Intent.VideoGeneration]: 0.08, [Intent.VoiceGeneration]: 0.06, [Intent.MusicGeneration]: 0.06,
                [Intent.Research]: 0.90, [Intent.Math]: 0.99, [Intent.Planning]: 0.86,
            },
            domains: {
                [Domain.Technology]: 0.95, [Domain.Business]: 0.89, [Domain.Health]: 0.88, [Domain.Legal]: 0.92,
                [Domain.Finance]: 0.94, [Domain.Education]: 0.90, [Domain.Science]: 0.97, [Domain.CreativeArts]: 0.70,
                [Domain.Lifestyle]: 0.68, [Domain.General]: 0.85, [Domain.Government]: 0.90, [Domain.Relationships]: 0.65,
                [Domain.Shopping]: 0.62, [Domain.EventPlanning]: 0.68, [Domain.Weather]: 0.66, [Domain.Sports]: 0.68,
            },
            complexity: { [Complexity.Quick]: 0.55, [Complexity.Standard]: 0.82, [Complexity.Demanding]: 0.99 },
        },
        humanFactors: {
            empathyScore: 0.78, playfulnessScore: 0.68, professionalismScore: 0.96,
            conciseness: 0.62, verbosity: 0.95, conversationalTone: 0.72,
            formalTone: 0.96, lateNightSuitability: 0.70, workHoursSuitability: 0.95,
        },
        specializations: ['reasoning', 'math'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'o4-mini', name: 'o4-mini', provider: 'openai',
        description: 'Fast, cost-efficient reasoning model. Superseded by GPT-5 mini but still available.',
        pricing: { inputPer1k: 0.0011, outputPer1k: 0.0044 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 100000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 1200, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.85, [Intent.Creative]: 0.72, [Intent.Analysis]: 0.87, [Intent.Factual]: 0.83,
                [Intent.Conversation]: 0.75, [Intent.Task]: 0.83, [Intent.Brainstorm]: 0.76, [Intent.Translation]: 0.78,
                [Intent.Summarization]: 0.82, [Intent.Extraction]: 0.84, [Intent.ImageGeneration]: 0.08,
                [Intent.VideoGeneration]: 0.06, [Intent.VoiceGeneration]: 0.05, [Intent.MusicGeneration]: 0.05,
                [Intent.Research]: 0.78, [Intent.Math]: 0.90, [Intent.Planning]: 0.78,
            },
            domains: {
                [Domain.Technology]: 0.87, [Domain.Business]: 0.82, [Domain.Health]: 0.80, [Domain.Legal]: 0.83,
                [Domain.Finance]: 0.85, [Domain.Education]: 0.83, [Domain.Science]: 0.88, [Domain.CreativeArts]: 0.70,
                [Domain.Lifestyle]: 0.73, [Domain.General]: 0.82, [Domain.Government]: 0.78, [Domain.Relationships]: 0.66,
                [Domain.Shopping]: 0.64, [Domain.EventPlanning]: 0.66, [Domain.Weather]: 0.64, [Domain.Sports]: 0.66,
            },
            complexity: { [Complexity.Quick]: 0.82, [Complexity.Standard]: 0.87, [Complexity.Demanding]: 0.88 },
        },
        humanFactors: {
            empathyScore: 0.80, playfulnessScore: 0.74, professionalismScore: 0.90,
            conciseness: 0.80, verbosity: 0.82, conversationalTone: 0.80,
            formalTone: 0.90, lateNightSuitability: 0.82, workHoursSuitability: 0.92,
        },
        specializations: ['reasoning', 'fast_tasks'],
        accessTier: AccessTier.Free,
        available: true,
    },

    // ===== GOOGLE MODELS =====

    {
        id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google',
        description: 'Most capable Gemini model with extended thinking and multimodal excellence.',
        pricing: { inputPer1k: 0.00125, outputPer1k: 0.01 },
        capabilities: {
            maxInputTokens: 1048576, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.96, audioScore: 0.94,
        },
        performance: { avgLatencyMs: 2000, reliabilityPercent: 99.4 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.90, [Intent.Creative]: 0.88, [Intent.Analysis]: 0.92, [Intent.Factual]: 0.91,
                [Intent.Conversation]: 0.89, [Intent.Task]: 0.90, [Intent.Brainstorm]: 0.89, [Intent.Translation]: 0.96,
                [Intent.Summarization]: 0.91, [Intent.Extraction]: 0.90, [Intent.ImageGeneration]: 0.14,
                [Intent.VideoGeneration]: 0.12, [Intent.VoiceGeneration]: 0.10, [Intent.MusicGeneration]: 0.10,
                [Intent.Research]: 0.87, [Intent.Math]: 0.93, [Intent.Planning]: 0.88,
            },
            domains: {
                [Domain.Technology]: 0.92, [Domain.Business]: 0.89, [Domain.Health]: 0.88, [Domain.Legal]: 0.87,
                [Domain.Finance]: 0.89, [Domain.Education]: 0.93, [Domain.Science]: 0.94, [Domain.CreativeArts]: 0.88,
                [Domain.Lifestyle]: 0.86, [Domain.General]: 0.92, [Domain.Government]: 0.85, [Domain.Relationships]: 0.80,
                [Domain.Shopping]: 0.78, [Domain.EventPlanning]: 0.80, [Domain.Weather]: 0.78, [Domain.Sports]: 0.78,
            },
            complexity: { [Complexity.Quick]: 0.82, [Complexity.Standard]: 0.93, [Complexity.Demanding]: 0.95 },
        },
        humanFactors: {
            empathyScore: 0.85, playfulnessScore: 0.82, professionalismScore: 0.92,
            conciseness: 0.78, verbosity: 0.88, conversationalTone: 0.88,
            formalTone: 0.90, lateNightSuitability: 0.85, workHoursSuitability: 0.94,
        },
        specializations: ['multilingual', 'multimodal', 'reasoning'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google',
        description: 'Fast, efficient Gemini model. Excellent cost-performance ratio with multilingual strength.',
        pricing: { inputPer1k: 0.000075, outputPer1k: 0.0003 },
        capabilities: {
            maxInputTokens: 1048576, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.90, audioScore: 0.88,
        },
        performance: { avgLatencyMs: 500, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.82, [Intent.Creative]: 0.80, [Intent.Analysis]: 0.82, [Intent.Factual]: 0.85,
                [Intent.Conversation]: 0.91, [Intent.Task]: 0.82, [Intent.Brainstorm]: 0.78, [Intent.Translation]: 0.92,
                [Intent.Summarization]: 0.85, [Intent.Extraction]: 0.84, [Intent.ImageGeneration]: 0.10,
                [Intent.VideoGeneration]: 0.08, [Intent.VoiceGeneration]: 0.07, [Intent.MusicGeneration]: 0.07,
                [Intent.Research]: 0.76, [Intent.Math]: 0.78, [Intent.Planning]: 0.78,
            },
            domains: {
                [Domain.Technology]: 0.83, [Domain.Business]: 0.80, [Domain.Health]: 0.78, [Domain.Legal]: 0.76,
                [Domain.Finance]: 0.79, [Domain.Education]: 0.85, [Domain.Science]: 0.82, [Domain.CreativeArts]: 0.80,
                [Domain.Lifestyle]: 0.84, [Domain.General]: 0.88, [Domain.Government]: 0.74, [Domain.Relationships]: 0.78,
                [Domain.Shopping]: 0.76, [Domain.EventPlanning]: 0.75, [Domain.Weather]: 0.74, [Domain.Sports]: 0.76,
            },
            complexity: { [Complexity.Quick]: 0.96, [Complexity.Standard]: 0.87, [Complexity.Demanding]: 0.74 },
        },
        humanFactors: {
            empathyScore: 0.80, playfulnessScore: 0.82, professionalismScore: 0.88,
            conciseness: 0.90, verbosity: 0.72, conversationalTone: 0.88,
            formalTone: 0.85, lateNightSuitability: 0.90, workHoursSuitability: 0.90,
        },
        specializations: ['fast_tasks', 'multilingual'],
        accessTier: AccessTier.Free,
        available: true,
    },

    {
        id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', provider: 'google',
        description: 'Lightweight Gemini model for cost-sensitive high-volume applications.',
        pricing: { inputPer1k: 0.000025, outputPer1k: 0.0001 },
        capabilities: {
            maxInputTokens: 1048576, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.82, audioScore: 0,
        },
        performance: { avgLatencyMs: 300, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.72, [Intent.Creative]: 0.70, [Intent.Analysis]: 0.72, [Intent.Factual]: 0.76,
                [Intent.Conversation]: 0.82, [Intent.Task]: 0.74, [Intent.Brainstorm]: 0.67, [Intent.Translation]: 0.84,
                [Intent.Summarization]: 0.78, [Intent.Extraction]: 0.80, [Intent.ImageGeneration]: 0.07,
                [Intent.VideoGeneration]: 0.06, [Intent.VoiceGeneration]: 0.05, [Intent.MusicGeneration]: 0.05,
                [Intent.Research]: 0.64, [Intent.Math]: 0.66, [Intent.Planning]: 0.64,
            },
            domains: {
                [Domain.Technology]: 0.73, [Domain.Business]: 0.71, [Domain.Health]: 0.69, [Domain.Legal]: 0.67,
                [Domain.Finance]: 0.70, [Domain.Education]: 0.76, [Domain.Science]: 0.72, [Domain.CreativeArts]: 0.70,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.80, [Domain.Government]: 0.64, [Domain.Relationships]: 0.70,
                [Domain.Shopping]: 0.70, [Domain.EventPlanning]: 0.65, [Domain.Weather]: 0.66, [Domain.Sports]: 0.68,
            },
            complexity: { [Complexity.Quick]: 0.96, [Complexity.Standard]: 0.80, [Complexity.Demanding]: 0.58 },
        },
        humanFactors: {
            empathyScore: 0.75, playfulnessScore: 0.78, professionalismScore: 0.82,
            conciseness: 0.95, verbosity: 0.55, conversationalTone: 0.85,
            formalTone: 0.80, lateNightSuitability: 0.92, workHoursSuitability: 0.85,
        },
        specializations: ['fast_tasks', 'budget'],
        accessTier: AccessTier.Free,
        available: true,
    },

    // ===== PERPLEXITY MODELS =====

    {
        id: 'sonar-pro', name: 'Perplexity Sonar Pro', provider: 'perplexity',
        description: 'Advanced search-augmented model for in-depth research and analysis with real-time web access.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.015 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 8000,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 3000, reliabilityPercent: 99.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.65, [Intent.Creative]: 0.55, [Intent.Analysis]: 0.93, [Intent.Factual]: 0.97,
                [Intent.Conversation]: 0.70, [Intent.Task]: 0.78, [Intent.Brainstorm]: 0.80, [Intent.Translation]: 0.72,
                [Intent.Summarization]: 0.90, [Intent.Extraction]: 0.88, [Intent.ImageGeneration]: 0.08,
                [Intent.VideoGeneration]: 0.06, [Intent.VoiceGeneration]: 0.04, [Intent.MusicGeneration]: 0.04,
                [Intent.Research]: 0.99, [Intent.Math]: 0.78, [Intent.Planning]: 0.80,
            },
            domains: {
                [Domain.Technology]: 0.92, [Domain.Business]: 0.90, [Domain.Health]: 0.92, [Domain.Legal]: 0.88,
                [Domain.Finance]: 0.93, [Domain.Education]: 0.90, [Domain.Science]: 0.94, [Domain.CreativeArts]: 0.65,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.88, [Domain.Government]: 0.88, [Domain.Relationships]: 0.72,
                [Domain.Shopping]: 0.80, [Domain.EventPlanning]: 0.74, [Domain.Weather]: 0.90, [Domain.Sports]: 0.85,
            },
            complexity: { [Complexity.Quick]: 0.88, [Complexity.Standard]: 0.93, [Complexity.Demanding]: 0.90 },
        },
        humanFactors: {
            empathyScore: 0.75, playfulnessScore: 0.70, professionalismScore: 0.92,
            conciseness: 0.80, verbosity: 0.85, conversationalTone: 0.78,
            formalTone: 0.90, lateNightSuitability: 0.78, workHoursSuitability: 0.94,
        },
        specializations: ['web_search', 'research'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'sonar', name: 'Perplexity Sonar', provider: 'perplexity',
        description: 'Fast search-augmented model for quick research and fact-checking with web access.',
        pricing: { inputPer1k: 0.001, outputPer1k: 0.001 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 8000,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 1500, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.58, [Intent.Creative]: 0.50, [Intent.Analysis]: 0.85, [Intent.Factual]: 0.94,
                [Intent.Conversation]: 0.68, [Intent.Task]: 0.72, [Intent.Brainstorm]: 0.72, [Intent.Translation]: 0.65,
                [Intent.Summarization]: 0.82, [Intent.Extraction]: 0.80, [Intent.ImageGeneration]: 0.06,
                [Intent.VideoGeneration]: 0.05, [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.92, [Intent.Math]: 0.70, [Intent.Planning]: 0.72,
            },
            domains: {
                [Domain.Technology]: 0.85, [Domain.Business]: 0.82, [Domain.Health]: 0.85, [Domain.Legal]: 0.80,
                [Domain.Finance]: 0.85, [Domain.Education]: 0.82, [Domain.Science]: 0.87, [Domain.CreativeArts]: 0.58,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.82, [Domain.Government]: 0.80, [Domain.Relationships]: 0.66,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.68, [Domain.Weather]: 0.84, [Domain.Sports]: 0.80,
            },
            complexity: { [Complexity.Quick]: 0.90, [Complexity.Standard]: 0.86, [Complexity.Demanding]: 0.80 },
        },
        humanFactors: {
            empathyScore: 0.72, playfulnessScore: 0.68, professionalismScore: 0.88,
            conciseness: 0.88, verbosity: 0.70, conversationalTone: 0.78,
            formalTone: 0.85, lateNightSuitability: 0.85, workHoursSuitability: 0.90,
        },
        specializations: ['web_search', 'research'],
        accessTier: AccessTier.Free,
        available: true,
    },

    // ===== XAI MODELS =====

    {
        id: 'grok-3', name: 'Grok 3', provider: 'xai',
        description: 'xAI flagship model with real-time web access, strong reasoning, and conversational style.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.015 },
        capabilities: {
            maxInputTokens: 131072, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            visionScore: 0.90, audioScore: 0,
        },
        performance: { avgLatencyMs: 1200, reliabilityPercent: 99.3 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.88, [Intent.Creative]: 0.85, [Intent.Analysis]: 0.91, [Intent.Factual]: 0.94,
                [Intent.Conversation]: 0.90, [Intent.Task]: 0.88, [Intent.Brainstorm]: 0.87, [Intent.Translation]: 0.82,
                [Intent.Summarization]: 0.89, [Intent.Extraction]: 0.88, [Intent.ImageGeneration]: 0.12,
                [Intent.VideoGeneration]: 0.10, [Intent.VoiceGeneration]: 0.08, [Intent.MusicGeneration]: 0.08,
                [Intent.Research]: 0.95, [Intent.Math]: 0.90, [Intent.Planning]: 0.86,
            },
            domains: {
                [Domain.Technology]: 0.92, [Domain.Business]: 0.88, [Domain.Health]: 0.86, [Domain.Legal]: 0.85,
                [Domain.Finance]: 0.90, [Domain.Education]: 0.88, [Domain.Science]: 0.91, [Domain.CreativeArts]: 0.84,
                [Domain.Lifestyle]: 0.85, [Domain.General]: 0.90, [Domain.Government]: 0.86, [Domain.Relationships]: 0.80,
                [Domain.Shopping]: 0.78, [Domain.EventPlanning]: 0.78, [Domain.Weather]: 0.82, [Domain.Sports]: 0.84,
            },
            complexity: { [Complexity.Quick]: 0.84, [Complexity.Standard]: 0.92, [Complexity.Demanding]: 0.93 },
        },
        humanFactors: {
            empathyScore: 0.82, playfulnessScore: 0.88, professionalismScore: 0.85,
            conciseness: 0.80, verbosity: 0.82, conversationalTone: 0.90,
            formalTone: 0.82, lateNightSuitability: 0.88, workHoursSuitability: 0.88,
        },
        specializations: ['web_search', 'research', 'reasoning'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'grok-3-mini', name: 'Grok 3 Mini', provider: 'xai',
        description: 'Fast, efficient xAI model with web access for quick research and conversational tasks.',
        pricing: { inputPer1k: 0.0006, outputPer1k: 0.004 },
        capabilities: {
            maxInputTokens: 131072, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 400, reliabilityPercent: 99.6 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.78, [Intent.Creative]: 0.75, [Intent.Analysis]: 0.80, [Intent.Factual]: 0.85,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.78, [Intent.Brainstorm]: 0.76, [Intent.Translation]: 0.74,
                [Intent.Summarization]: 0.80, [Intent.Extraction]: 0.78, [Intent.ImageGeneration]: 0.08,
                [Intent.VideoGeneration]: 0.06, [Intent.VoiceGeneration]: 0.05, [Intent.MusicGeneration]: 0.05,
                [Intent.Research]: 0.84, [Intent.Math]: 0.76, [Intent.Planning]: 0.74,
            },
            domains: {
                [Domain.Technology]: 0.80, [Domain.Business]: 0.78, [Domain.Health]: 0.76, [Domain.Legal]: 0.74,
                [Domain.Finance]: 0.78, [Domain.Education]: 0.78, [Domain.Science]: 0.80, [Domain.CreativeArts]: 0.74,
                [Domain.Lifestyle]: 0.78, [Domain.General]: 0.82, [Domain.Government]: 0.74, [Domain.Relationships]: 0.74,
                [Domain.Shopping]: 0.73, [Domain.EventPlanning]: 0.72, [Domain.Weather]: 0.76, [Domain.Sports]: 0.78,
            },
            complexity: { [Complexity.Quick]: 0.93, [Complexity.Standard]: 0.84, [Complexity.Demanding]: 0.72 },
        },
        humanFactors: {
            empathyScore: 0.78, playfulnessScore: 0.82, professionalismScore: 0.82,
            conciseness: 0.88, verbosity: 0.68, conversationalTone: 0.86,
            formalTone: 0.78, lateNightSuitability: 0.90, workHoursSuitability: 0.85,
        },
        specializations: ['web_search', 'fast_tasks'],
        accessTier: AccessTier.Free,
        available: true,
    },

    // ===== MISTRAL MODELS =====

    {
        id: 'mistral-large', name: 'Mistral Large', provider: 'mistral',
        description: 'Flagship Mistral model with excellent multilingual capabilities and strong coding performance.',
        pricing: { inputPer1k: 0.002, outputPer1k: 0.006 },
        capabilities: {
            maxInputTokens: 131072, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 900, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.90, [Intent.Creative]: 0.83, [Intent.Analysis]: 0.88, [Intent.Factual]: 0.87,
                [Intent.Conversation]: 0.84, [Intent.Task]: 0.87, [Intent.Brainstorm]: 0.84, [Intent.Translation]: 0.95,
                [Intent.Summarization]: 0.87, [Intent.Extraction]: 0.86, [Intent.ImageGeneration]: 0.10,
                [Intent.VideoGeneration]: 0.08, [Intent.VoiceGeneration]: 0.06, [Intent.MusicGeneration]: 0.06,
                [Intent.Research]: 0.80, [Intent.Math]: 0.86, [Intent.Planning]: 0.82,
            },
            domains: {
                [Domain.Technology]: 0.91, [Domain.Business]: 0.86, [Domain.Health]: 0.83, [Domain.Legal]: 0.85,
                [Domain.Finance]: 0.86, [Domain.Education]: 0.88, [Domain.Science]: 0.89, [Domain.CreativeArts]: 0.82,
                [Domain.Lifestyle]: 0.80, [Domain.General]: 0.87, [Domain.Government]: 0.83, [Domain.Relationships]: 0.75,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.74, [Domain.Weather]: 0.70, [Domain.Sports]: 0.72,
            },
            complexity: { [Complexity.Quick]: 0.82, [Complexity.Standard]: 0.92, [Complexity.Demanding]: 0.90 },
        },
        humanFactors: {
            empathyScore: 0.78, playfulnessScore: 0.72, professionalismScore: 0.90,
            conciseness: 0.78, verbosity: 0.82, conversationalTone: 0.78,
            formalTone: 0.90, lateNightSuitability: 0.80, workHoursSuitability: 0.92,
        },
        specializations: ['multilingual', 'coding'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'mistral-small', name: 'Mistral Small', provider: 'mistral',
        description: 'Fast, efficient Mistral model optimized for low-latency tasks with strong multilingual support.',
        pricing: { inputPer1k: 0.0002, outputPer1k: 0.0006 },
        capabilities: {
            maxInputTokens: 131072, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 300, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.78, [Intent.Creative]: 0.74, [Intent.Analysis]: 0.76, [Intent.Factual]: 0.78,
                [Intent.Conversation]: 0.82, [Intent.Task]: 0.76, [Intent.Brainstorm]: 0.73, [Intent.Translation]: 0.88,
                [Intent.Summarization]: 0.78, [Intent.Extraction]: 0.76, [Intent.ImageGeneration]: 0.06,
                [Intent.VideoGeneration]: 0.05, [Intent.VoiceGeneration]: 0.04, [Intent.MusicGeneration]: 0.04,
                [Intent.Research]: 0.66, [Intent.Math]: 0.72, [Intent.Planning]: 0.70,
            },
            domains: {
                [Domain.Technology]: 0.78, [Domain.Business]: 0.75, [Domain.Health]: 0.73, [Domain.Legal]: 0.72,
                [Domain.Finance]: 0.74, [Domain.Education]: 0.78, [Domain.Science]: 0.77, [Domain.CreativeArts]: 0.74,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.80, [Domain.Government]: 0.70, [Domain.Relationships]: 0.72,
                [Domain.Shopping]: 0.70, [Domain.EventPlanning]: 0.68, [Domain.Weather]: 0.66, [Domain.Sports]: 0.68,
            },
            complexity: { [Complexity.Quick]: 0.93, [Complexity.Standard]: 0.82, [Complexity.Demanding]: 0.65 },
        },
        humanFactors: {
            empathyScore: 0.74, playfulnessScore: 0.72, professionalismScore: 0.85,
            conciseness: 0.90, verbosity: 0.62, conversationalTone: 0.80,
            formalTone: 0.85, lateNightSuitability: 0.88, workHoursSuitability: 0.88,
        },
        specializations: ['fast_tasks', 'multilingual'],
        accessTier: AccessTier.Free,
        available: true,
    },

    // ===== DEEPSEEK MODELS =====

    {
        id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'deepseek',
        description: 'Open-source reasoning model with exceptional math, science, and coding capabilities at very low cost.',
        pricing: { inputPer1k: 0.00055, outputPer1k: 0.00219 },
        capabilities: {
            maxInputTokens: 131072, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsReasoning: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 2500, reliabilityPercent: 99.0 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.93, [Intent.Creative]: 0.75, [Intent.Analysis]: 0.94, [Intent.Factual]: 0.88,
                [Intent.Conversation]: 0.72, [Intent.Task]: 0.88, [Intent.Brainstorm]: 0.80, [Intent.Translation]: 0.78,
                [Intent.Summarization]: 0.86, [Intent.Extraction]: 0.88, [Intent.ImageGeneration]: 0.08,
                [Intent.VideoGeneration]: 0.06, [Intent.VoiceGeneration]: 0.04, [Intent.MusicGeneration]: 0.04,
                [Intent.Research]: 0.82, [Intent.Math]: 0.96, [Intent.Planning]: 0.82,
            },
            domains: {
                [Domain.Technology]: 0.94, [Domain.Business]: 0.84, [Domain.Health]: 0.82, [Domain.Legal]: 0.86,
                [Domain.Finance]: 0.88, [Domain.Education]: 0.88, [Domain.Science]: 0.95, [Domain.CreativeArts]: 0.70,
                [Domain.Lifestyle]: 0.68, [Domain.General]: 0.82, [Domain.Government]: 0.80, [Domain.Relationships]: 0.64,
                [Domain.Shopping]: 0.60, [Domain.EventPlanning]: 0.62, [Domain.Weather]: 0.62, [Domain.Sports]: 0.64,
            },
            complexity: { [Complexity.Quick]: 0.72, [Complexity.Standard]: 0.90, [Complexity.Demanding]: 0.96 },
        },
        humanFactors: {
            empathyScore: 0.65, playfulnessScore: 0.58, professionalismScore: 0.88,
            conciseness: 0.72, verbosity: 0.85, conversationalTone: 0.65,
            formalTone: 0.88, lateNightSuitability: 0.75, workHoursSuitability: 0.90,
        },
        specializations: ['reasoning', 'math', 'coding'],
        accessTier: AccessTier.Free,
        available: true,
    },

    // ===== GENERATION MODELS =====

    {
        id: 'dall-e-3', name: 'DALL-E 3', provider: 'openai',
        description: 'State-of-the-art image generation model. Creates high-quality images from text descriptions.',
        pricing: { inputPer1k: 0.040, outputPer1k: 0.080 },
        capabilities: {
            maxInputTokens: 4000, maxOutputTokens: 1,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsImageGeneration: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 8000, reliabilityPercent: 98.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.05, [Intent.Creative]: 0.15, [Intent.Analysis]: 0.05, [Intent.Factual]: 0.05,
                [Intent.Conversation]: 0.05, [Intent.Task]: 0.10, [Intent.Brainstorm]: 0.10, [Intent.Translation]: 0.03,
                [Intent.Summarization]: 0.03, [Intent.Extraction]: 0.03, [Intent.ImageGeneration]: 0.97,
                [Intent.VideoGeneration]: 0.10, [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.05, [Intent.Math]: 0.03, [Intent.Planning]: 0.08,
            },
            domains: {
                [Domain.Technology]: 0.30, [Domain.Business]: 0.35, [Domain.Health]: 0.20, [Domain.Legal]: 0.10,
                [Domain.Finance]: 0.15, [Domain.Education]: 0.25, [Domain.Science]: 0.25, [Domain.CreativeArts]: 0.92,
                [Domain.Lifestyle]: 0.45, [Domain.General]: 0.50, [Domain.Government]: 0.10, [Domain.Relationships]: 0.30,
                [Domain.Shopping]: 0.40, [Domain.EventPlanning]: 0.35, [Domain.Weather]: 0.20, [Domain.Sports]: 0.25,
            },
            complexity: { [Complexity.Quick]: 0.85, [Complexity.Standard]: 0.90, [Complexity.Demanding]: 0.75 },
        },
        humanFactors: {
            empathyScore: 0.10, playfulnessScore: 0.30, professionalismScore: 0.40,
            conciseness: 0.95, verbosity: 0.10, conversationalTone: 0.10,
            formalTone: 0.30, lateNightSuitability: 0.80, workHoursSuitability: 0.80,
        },
        specializations: ['image_generation'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'imagen-3', name: 'Imagen 3', provider: 'google',
        description: 'Google DeepMind image generation with photorealistic quality and excellent text rendering.',
        pricing: { inputPer1k: 0.040, outputPer1k: 0.060 },
        capabilities: {
            maxInputTokens: 4000, maxOutputTokens: 1,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsImageGeneration: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 6000, reliabilityPercent: 98.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.04, [Intent.Creative]: 0.14, [Intent.Analysis]: 0.04, [Intent.Factual]: 0.04,
                [Intent.Conversation]: 0.04, [Intent.Task]: 0.08, [Intent.Brainstorm]: 0.08, [Intent.Translation]: 0.03,
                [Intent.Summarization]: 0.03, [Intent.Extraction]: 0.03, [Intent.ImageGeneration]: 0.96,
                [Intent.VideoGeneration]: 0.08, [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.04, [Intent.Math]: 0.03, [Intent.Planning]: 0.07,
            },
            domains: {
                [Domain.Technology]: 0.28, [Domain.Business]: 0.32, [Domain.Health]: 0.18, [Domain.Legal]: 0.08,
                [Domain.Finance]: 0.12, [Domain.Education]: 0.22, [Domain.Science]: 0.24, [Domain.CreativeArts]: 0.90,
                [Domain.Lifestyle]: 0.42, [Domain.General]: 0.48, [Domain.Government]: 0.08, [Domain.Relationships]: 0.28,
                [Domain.Shopping]: 0.38, [Domain.EventPlanning]: 0.33, [Domain.Weather]: 0.18, [Domain.Sports]: 0.23,
            },
            complexity: { [Complexity.Quick]: 0.85, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.72 },
        },
        humanFactors: {
            empathyScore: 0.10, playfulnessScore: 0.28, professionalismScore: 0.38,
            conciseness: 0.95, verbosity: 0.10, conversationalTone: 0.10,
            formalTone: 0.28, lateNightSuitability: 0.80, workHoursSuitability: 0.80,
        },
        specializations: ['image_generation'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'stable-diffusion-3.5', name: 'Stable Diffusion 3.5', provider: 'stability',
        description: 'Open-source image generation with fine control over artistic style and composition.',
        pricing: { inputPer1k: 0.030, outputPer1k: 0.050 },
        capabilities: {
            maxInputTokens: 4000, maxOutputTokens: 1,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsImageGeneration: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 5000, reliabilityPercent: 98.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.03, [Intent.Creative]: 0.13, [Intent.Analysis]: 0.03, [Intent.Factual]: 0.03,
                [Intent.Conversation]: 0.03, [Intent.Task]: 0.07, [Intent.Brainstorm]: 0.07, [Intent.Translation]: 0.02,
                [Intent.Summarization]: 0.02, [Intent.Extraction]: 0.02, [Intent.ImageGeneration]: 0.94,
                [Intent.VideoGeneration]: 0.07, [Intent.VoiceGeneration]: 0.02, [Intent.MusicGeneration]: 0.02,
                [Intent.Research]: 0.03, [Intent.Math]: 0.02, [Intent.Planning]: 0.06,
            },
            domains: {
                [Domain.Technology]: 0.25, [Domain.Business]: 0.28, [Domain.Health]: 0.15, [Domain.Legal]: 0.06,
                [Domain.Finance]: 0.10, [Domain.Education]: 0.18, [Domain.Science]: 0.20, [Domain.CreativeArts]: 0.93,
                [Domain.Lifestyle]: 0.40, [Domain.General]: 0.45, [Domain.Government]: 0.06, [Domain.Relationships]: 0.25,
                [Domain.Shopping]: 0.35, [Domain.EventPlanning]: 0.30, [Domain.Weather]: 0.15, [Domain.Sports]: 0.20,
            },
            complexity: { [Complexity.Quick]: 0.88, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.68 },
        },
        humanFactors: {
            empathyScore: 0.08, playfulnessScore: 0.32, professionalismScore: 0.35,
            conciseness: 0.95, verbosity: 0.10, conversationalTone: 0.08,
            formalTone: 0.28, lateNightSuitability: 0.82, workHoursSuitability: 0.78,
        },
        specializations: ['image_generation'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'sora', name: 'Sora', provider: 'openai',
        description: 'OpenAI video generation model. Creates high-quality videos from text with cinematic quality.',
        pricing: { inputPer1k: 0.100, outputPer1k: 0.200 },
        capabilities: {
            maxInputTokens: 4000, maxOutputTokens: 1,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsVideoGeneration: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 30000, reliabilityPercent: 97.0 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.03, [Intent.Creative]: 0.12, [Intent.Analysis]: 0.03, [Intent.Factual]: 0.03,
                [Intent.Conversation]: 0.03, [Intent.Task]: 0.07, [Intent.Brainstorm]: 0.08, [Intent.Translation]: 0.02,
                [Intent.Summarization]: 0.02, [Intent.Extraction]: 0.02, [Intent.ImageGeneration]: 0.15,
                [Intent.VideoGeneration]: 0.97, [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.03, [Intent.Math]: 0.02, [Intent.Planning]: 0.06,
            },
            domains: {
                [Domain.Technology]: 0.25, [Domain.Business]: 0.30, [Domain.Health]: 0.15, [Domain.Legal]: 0.08,
                [Domain.Finance]: 0.12, [Domain.Education]: 0.22, [Domain.Science]: 0.20, [Domain.CreativeArts]: 0.90,
                [Domain.Lifestyle]: 0.42, [Domain.General]: 0.45, [Domain.Government]: 0.08, [Domain.Relationships]: 0.25,
                [Domain.Shopping]: 0.30, [Domain.EventPlanning]: 0.35, [Domain.Weather]: 0.18, [Domain.Sports]: 0.28,
            },
            complexity: { [Complexity.Quick]: 0.72, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.82 },
        },
        humanFactors: {
            empathyScore: 0.08, playfulnessScore: 0.28, professionalismScore: 0.38,
            conciseness: 0.95, verbosity: 0.10, conversationalTone: 0.08,
            formalTone: 0.28, lateNightSuitability: 0.78, workHoursSuitability: 0.78,
        },
        specializations: ['video_generation'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'veo-2', name: 'Veo 2', provider: 'google',
        description: 'Google DeepMind video generation with high-fidelity output and realistic physics.',
        pricing: { inputPer1k: 0.080, outputPer1k: 0.150 },
        capabilities: {
            maxInputTokens: 4000, maxOutputTokens: 1,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsVideoGeneration: true,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 25000, reliabilityPercent: 97.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.03, [Intent.Creative]: 0.11, [Intent.Analysis]: 0.03, [Intent.Factual]: 0.03,
                [Intent.Conversation]: 0.03, [Intent.Task]: 0.06, [Intent.Brainstorm]: 0.07, [Intent.Translation]: 0.02,
                [Intent.Summarization]: 0.02, [Intent.Extraction]: 0.02, [Intent.ImageGeneration]: 0.12,
                [Intent.VideoGeneration]: 0.95, [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.03, [Intent.Math]: 0.02, [Intent.Planning]: 0.05,
            },
            domains: {
                [Domain.Technology]: 0.23, [Domain.Business]: 0.28, [Domain.Health]: 0.13, [Domain.Legal]: 0.06,
                [Domain.Finance]: 0.10, [Domain.Education]: 0.20, [Domain.Science]: 0.18, [Domain.CreativeArts]: 0.88,
                [Domain.Lifestyle]: 0.40, [Domain.General]: 0.43, [Domain.Government]: 0.06, [Domain.Relationships]: 0.23,
                [Domain.Shopping]: 0.28, [Domain.EventPlanning]: 0.33, [Domain.Weather]: 0.16, [Domain.Sports]: 0.26,
            },
            complexity: { [Complexity.Quick]: 0.74, [Complexity.Standard]: 0.87, [Complexity.Demanding]: 0.80 },
        },
        humanFactors: {
            empathyScore: 0.08, playfulnessScore: 0.26, professionalismScore: 0.36,
            conciseness: 0.95, verbosity: 0.10, conversationalTone: 0.08,
            formalTone: 0.26, lateNightSuitability: 0.78, workHoursSuitability: 0.78,
        },
        specializations: ['video_generation'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'openai-tts', name: 'OpenAI TTS', provider: 'openai',
        description: 'High-quality text-to-speech model with natural-sounding voices and multiple voice options.',
        pricing: { inputPer1k: 0.015, outputPer1k: 0.015 },
        capabilities: {
            maxInputTokens: 4096, maxOutputTokens: 1,
            supportsStreaming: true, supportsVision: false, supportsAudio: true,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsTTS: true,
            visionScore: 0, audioScore: 0.92,
        },
        performance: { avgLatencyMs: 500, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.03, [Intent.Creative]: 0.08, [Intent.Analysis]: 0.03, [Intent.Factual]: 0.03,
                [Intent.Conversation]: 0.05, [Intent.Task]: 0.05, [Intent.Brainstorm]: 0.03, [Intent.Translation]: 0.05,
                [Intent.Summarization]: 0.03, [Intent.Extraction]: 0.02, [Intent.ImageGeneration]: 0.02,
                [Intent.VideoGeneration]: 0.03, [Intent.VoiceGeneration]: 0.96, [Intent.MusicGeneration]: 0.10,
                [Intent.Research]: 0.02, [Intent.Math]: 0.02, [Intent.Planning]: 0.03,
            },
            domains: {
                [Domain.Technology]: 0.15, [Domain.Business]: 0.25, [Domain.Health]: 0.15, [Domain.Legal]: 0.12,
                [Domain.Finance]: 0.12, [Domain.Education]: 0.30, [Domain.Science]: 0.12, [Domain.CreativeArts]: 0.35,
                [Domain.Lifestyle]: 0.30, [Domain.General]: 0.35, [Domain.Government]: 0.12, [Domain.Relationships]: 0.20,
                [Domain.Shopping]: 0.15, [Domain.EventPlanning]: 0.20, [Domain.Weather]: 0.15, [Domain.Sports]: 0.15,
            },
            complexity: { [Complexity.Quick]: 0.92, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.60 },
        },
        humanFactors: {
            empathyScore: 0.12, playfulnessScore: 0.15, professionalismScore: 0.45,
            conciseness: 0.95, verbosity: 0.10, conversationalTone: 0.15,
            formalTone: 0.35, lateNightSuitability: 0.85, workHoursSuitability: 0.85,
        },
        specializations: ['voice_generation'],
        accessTier: AccessTier.Pro,
        available: true,
    },

    {
        id: 'elevenlabs-v3', name: 'ElevenLabs v3', provider: 'elevenlabs',
        description: 'Premium voice synthesis with ultra-realistic speech, voice cloning, and emotional expression.',
        pricing: { inputPer1k: 0.030, outputPer1k: 0.030 },
        capabilities: {
            maxInputTokens: 4096, maxOutputTokens: 1,
            supportsStreaming: true, supportsVision: false, supportsAudio: true,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsTTS: true,
            visionScore: 0, audioScore: 0.96,
        },
        performance: { avgLatencyMs: 600, reliabilityPercent: 99.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.02, [Intent.Creative]: 0.10, [Intent.Analysis]: 0.02, [Intent.Factual]: 0.02,
                [Intent.Conversation]: 0.05, [Intent.Task]: 0.04, [Intent.Brainstorm]: 0.03, [Intent.Translation]: 0.06,
                [Intent.Summarization]: 0.02, [Intent.Extraction]: 0.02, [Intent.ImageGeneration]: 0.02,
                [Intent.VideoGeneration]: 0.03, [Intent.VoiceGeneration]: 0.98, [Intent.MusicGeneration]: 0.12,
                [Intent.Research]: 0.02, [Intent.Math]: 0.02, [Intent.Planning]: 0.03,
            },
            domains: {
                [Domain.Technology]: 0.12, [Domain.Business]: 0.22, [Domain.Health]: 0.12, [Domain.Legal]: 0.10,
                [Domain.Finance]: 0.10, [Domain.Education]: 0.28, [Domain.Science]: 0.10, [Domain.CreativeArts]: 0.40,
                [Domain.Lifestyle]: 0.28, [Domain.General]: 0.32, [Domain.Government]: 0.10, [Domain.Relationships]: 0.18,
                [Domain.Shopping]: 0.12, [Domain.EventPlanning]: 0.18, [Domain.Weather]: 0.12, [Domain.Sports]: 0.12,
            },
            complexity: { [Complexity.Quick]: 0.90, [Complexity.Standard]: 0.90, [Complexity.Demanding]: 0.65 },
        },
        humanFactors: {
            empathyScore: 0.15, playfulnessScore: 0.18, professionalismScore: 0.42,
            conciseness: 0.95, verbosity: 0.10, conversationalTone: 0.18,
            formalTone: 0.32, lateNightSuitability: 0.85, workHoursSuitability: 0.82,
        },
        specializations: ['voice_generation'],
        accessTier: AccessTier.Pro,
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

// Get models available for a specific access tier
export function getModelsForTier(tier: AccessTier): ModelDefinition[] {
    if (tier === AccessTier.Pro) {
        // Pro users get ALL available models (free + pro)
        return models.filter((model) => model.available);
    }
    // Free users only get free-tier models
    return models.filter(
        (model) => model.available && model.accessTier === AccessTier.Free
    );
}

// Check if a specific model is accessible for a tier
export function isModelAccessible(modelId: string, tier: AccessTier): boolean {
    const model = modelMap.get(modelId);
    if (!model || !model.available) return false;
    if (tier === AccessTier.Pro) return true;
    return model.accessTier === AccessTier.Free;
}

// Get pro-only models (for upgrade hint generation)
export function getUpgradeModels(currentTier: AccessTier): ModelDefinition[] {
    if (currentTier === AccessTier.Pro) return [];
    return models.filter(
        (model) => model.available && model.accessTier === AccessTier.Pro
    );
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
    const filteredModels = provider
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
        accessTier: model.accessTier,
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
        if (constraints.allowedModels && constraints.allowedModels.length > 0) {
            if (!constraints.allowedModels.includes(model.id)) {
                return false;
            }
        }
        if (constraints.excludedModels && constraints.excludedModels.length > 0) {
            if (constraints.excludedModels.includes(model.id)) {
                return false;
            }
        }
        if (constraints.maxCostPer1kTokens !== undefined) {
            const avgCost = (model.pricing.inputPer1k + model.pricing.outputPer1k) / 2;
            if (avgCost > constraints.maxCostPer1kTokens) {
                return false;
            }
        }
        if (constraints.maxLatencyMs !== undefined) {
            if (model.performance.avgLatencyMs > constraints.maxLatencyMs) {
                return false;
            }
        }
        if (constraints.requireStreaming && !model.capabilities.supportsStreaming) {
            return false;
        }
        if (constraints.requireVision && !model.capabilities.supportsVision) {
            return false;
        }
        return !(constraints.requireAudio && !model.capabilities.supportsAudio);
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
