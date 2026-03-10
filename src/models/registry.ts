import {
    ModelDefinition,
    ModelInfo,
    Intent,
    Domain,
    Complexity,
    AccessTier,
    Constraints,
} from '@/types';
/**
 * Araveil Model Registry v3.0
 * 48 models across 6 providers
 *
 * Last verified: March 5, 2026
 *
 * Sources:
 * - Anthropic: platform.claude.com/docs/en/about-claude/pricing
 * - OpenAI: developers.openai.com/api/docs/pricing (Standard tier)
 * - Google: ai.google.dev/gemini-api/docs/pricing (Paid tier)
 * - xAI: docs.x.ai/developers/models
 * - Perplexity: docs.perplexity.ai/docs/getting-started/pricing
 * - ElevenLabs: elevenlabs.io/pricing/api (Scale plan rates)
 *
 * PRICING: All pricing.inputPer1k / outputPer1k values are USD per 1,000 tokens.
 * To convert from provider docs (per MTok), divide by 1,000.
 * Example: $5.00/MTok = $0.005 per 1K tokens
 *
 * IMPORTANT NOTES:
 * - Claude does NOT support image generation. Vision = image understanding only.
 * - OpenAI reasoning models have hidden reasoning tokens billed as output.
 * - Perplexity models have per-request fees ON TOP of token costs.
 * - ElevenLabs pricing is per-character or per-minute, not per-token.
 * - Google long-context pricing (>200K tokens) is 2x input, 1.5x output.
 *
 * REMOVED PROVIDERS: Mistral, StabilityAI, DeepSeek (per business decision)
 * REMOVED MODELS: All deprecated, discontinued, computer-use, robotics, music-gen-experimental
 */
const models: ModelDefinition[] = [
    // ---------------------------------------------------------------
    // Claude Opus 4.6 (ANTHROPIC)
    // ---------------------------------------------------------------
    {
        id: 'claude-opus-4-6',
        name: 'Claude Opus 4.6',
        provider: 'anthropic',
        description: 'Most intelligent Claude. Agent teams, adaptive thinking, compaction. 200K context (1M beta). 128K max output. Released Feb 2026.',
        pricing: { inputPer1k: 0.005, outputPer1k: 0.025, cachedInputPer1k: 0.0005 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: true,
            supportsCodeExecution: true, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.97, audioScore: 0,
        },
        performance: { avgLatencyMs: 2000, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.96, [Intent.Creative]: 0.97,
                [Intent.Analysis]: 0.96, [Intent.Factual]: 0.93,
                [Intent.Conversation]: 0.88, [Intent.Task]: 0.95,
                [Intent.Brainstorm]: 0.95, [Intent.Translation]: 0.87,
                [Intent.Summarization]: 0.94, [Intent.Extraction]: 0.93,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.88, [Intent.Math]: 0.93, [Intent.Planning]: 0.91,
            },
            domains: {
                [Domain.Technology]: 0.97, [Domain.Business]: 0.93,
                [Domain.Health]: 0.9, [Domain.Legal]: 0.92,
                [Domain.Finance]: 0.92, [Domain.Education]: 0.94,
                [Domain.Science]: 0.95, [Domain.CreativeArts]: 0.95,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.93,
                [Domain.Government]: 0.88, [Domain.Relationships]: 0.8,
                [Domain.Shopping]: 0.75, [Domain.EventPlanning]: 0.8,
                [Domain.Weather]: 0.72, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.75, [Complexity.Standard]: 0.95, [Complexity.Demanding]: 0.99 },
        },
        humanFactors: {
            empathyScore: 0.96, playfulnessScore: 0.9,
            professionalismScore: 0.98, conciseness: 0.78,
            verbosity: 0.88, conversationalTone: 0.93,
            formalTone: 0.96, lateNightSuitability: 0.86, workHoursSuitability: 0.98,
        },
        specializations: ['creative_writing', 'reasoning', 'coding', 'agentic', 'extended_thinking'],
        accessTier: AccessTier.Premium, creditCost: 22,
        toolPricing: { webSearchPer1k: 10.0 },
        available: true,
    },
    // ---------------------------------------------------------------
    // Claude Opus 4.5 (ANTHROPIC)
    // ---------------------------------------------------------------
    {
        id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', provider: 'anthropic',
        description: 'Previous flagship. 80.9% SWE-bench. State-of-the-art coding, reasoning, agentic. 200K context, 64K output.',
        pricing: { inputPer1k: 0.005, outputPer1k: 0.025, cachedInputPer1k: 0.0005 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.96, audioScore: 0,
        },
        performance: { avgLatencyMs: 2000, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.95, [Intent.Creative]: 0.96, [Intent.Analysis]: 0.95, [Intent.Factual]: 0.92,
                [Intent.Conversation]: 0.87, [Intent.Task]: 0.94, [Intent.Brainstorm]: 0.95, [Intent.Translation]: 0.86,
                [Intent.Summarization]: 0.93, [Intent.Extraction]: 0.92,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.86, [Intent.Math]: 0.91, [Intent.Planning]: 0.9,
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
            empathyScore: 0.96, playfulnessScore: 0.9, professionalismScore: 0.98, conciseness: 0.78,
            verbosity: 0.88, conversationalTone: 0.93, formalTone: 0.96,
            lateNightSuitability: 0.86, workHoursSuitability: 0.98,
        },
        specializations: ['creative_writing', 'reasoning', 'coding', 'agentic'],
        accessTier: AccessTier.Premium, creditCost: 22,
        toolPricing: { webSearchPer1k: 10.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Claude Sonnet 4.6 (ANTHROPIC)
    // ---------------------------------------------------------------
    {
        id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'anthropic',
        description: 'Best speed/intelligence balance. Near-Opus at 1/5 cost. 79.6% SWE-bench. 200K context (1M beta), 64K output. Feb 2026.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.015, cachedInputPer1k: 0.0003 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: true,
            supportsCodeExecution: true, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.95, audioScore: 0,
        },
        performance: { avgLatencyMs: 950, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.95, [Intent.Creative]: 0.9, [Intent.Analysis]: 0.93, [Intent.Factual]: 0.91,
                [Intent.Conversation]: 0.89, [Intent.Task]: 0.93, [Intent.Brainstorm]: 0.91, [Intent.Translation]: 0.86,
                [Intent.Summarization]: 0.92, [Intent.Extraction]: 0.91,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.85, [Intent.Math]: 0.9, [Intent.Planning]: 0.88,
            },
            domains: {
                [Domain.Technology]: 0.95, [Domain.Business]: 0.91, [Domain.Health]: 0.88, [Domain.Legal]: 0.89,
                [Domain.Finance]: 0.9, [Domain.Education]: 0.92, [Domain.Science]: 0.93, [Domain.CreativeArts]: 0.9,
                [Domain.Lifestyle]: 0.84, [Domain.General]: 0.92, [Domain.Government]: 0.85, [Domain.Relationships]: 0.78,
                [Domain.Shopping]: 0.73, [Domain.EventPlanning]: 0.77, [Domain.Weather]: 0.7, [Domain.Sports]: 0.72,
            },
            complexity: { [Complexity.Quick]: 0.88, [Complexity.Standard]: 0.96, [Complexity.Demanding]: 0.93 },
        },
        humanFactors: {
            empathyScore: 0.93, playfulnessScore: 0.88, professionalismScore: 0.96, conciseness: 0.83,
            verbosity: 0.83, conversationalTone: 0.92, formalTone: 0.94,
            lateNightSuitability: 0.89, workHoursSuitability: 0.97,
        },
        specializations: ['coding', 'general_purpose', 'extended_thinking'],
        accessTier: AccessTier.Pro, creditCost: 14,
        toolPricing: { webSearchPer1k: 10.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Claude Sonnet 4.5 (ANTHROPIC)
    // ---------------------------------------------------------------
    {
        id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', provider: 'anthropic',
        description: 'Best coding model with industry-leading agent capabilities. Ideal balance of intelligence, speed, cost. 200K context, 64K output.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.015, cachedInputPer1k: 0.0003 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.94, audioScore: 0,
        },
        performance: { avgLatencyMs: 1000, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.94, [Intent.Creative]: 0.88, [Intent.Analysis]: 0.91, [Intent.Factual]: 0.89,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.91, [Intent.Brainstorm]: 0.89, [Intent.Translation]: 0.84,
                [Intent.Summarization]: 0.9, [Intent.Extraction]: 0.89,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.82, [Intent.Math]: 0.88, [Intent.Planning]: 0.85,
            },
            domains: {
                [Domain.Technology]: 0.94, [Domain.Business]: 0.89, [Domain.Health]: 0.86, [Domain.Legal]: 0.87,
                [Domain.Finance]: 0.88, [Domain.Education]: 0.91, [Domain.Science]: 0.92, [Domain.CreativeArts]: 0.88,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.9, [Domain.Government]: 0.83, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.75, [Domain.Weather]: 0.68, [Domain.Sports]: 0.7,
            },
            complexity: { [Complexity.Quick]: 0.86, [Complexity.Standard]: 0.94, [Complexity.Demanding]: 0.92 },
        },
        humanFactors: {
            empathyScore: 0.92, playfulnessScore: 0.87, professionalismScore: 0.95, conciseness: 0.82,
            verbosity: 0.84, conversationalTone: 0.91, formalTone: 0.93,
            lateNightSuitability: 0.88, workHoursSuitability: 0.96,
        },
        specializations: ['coding', 'agentic'],
        accessTier: AccessTier.Pro, creditCost: 14,
        toolPricing: { webSearchPer1k: 10.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Claude Haiku 4.5 (ANTHROPIC)
    // ---------------------------------------------------------------
    {
        id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic',
        description: 'Fastest Claude with near-frontier intelligence. High-volume quick tasks. 200K context, 64K output.',
        pricing: { inputPer1k: 0.001, outputPer1k: 0.005, cachedInputPer1k: 0.0001 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 64000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 400, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.82, [Intent.Creative]: 0.78, [Intent.Analysis]: 0.8, [Intent.Factual]: 0.82,
                [Intent.Conversation]: 0.88, [Intent.Task]: 0.8, [Intent.Brainstorm]: 0.77, [Intent.Translation]: 0.78,
                [Intent.Summarization]: 0.82, [Intent.Extraction]: 0.8,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.72, [Intent.Math]: 0.75, [Intent.Planning]: 0.74,
            },
            domains: {
                [Domain.Technology]: 0.82, [Domain.Business]: 0.78, [Domain.Health]: 0.76, [Domain.Legal]: 0.74,
                [Domain.Finance]: 0.76, [Domain.Education]: 0.8, [Domain.Science]: 0.79, [Domain.CreativeArts]: 0.77,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.84, [Domain.Government]: 0.72, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.72, [Domain.Weather]: 0.7, [Domain.Sports]: 0.72,
            },
            complexity: { [Complexity.Quick]: 0.97, [Complexity.Standard]: 0.85, [Complexity.Demanding]: 0.68 },
        },
        humanFactors: {
            empathyScore: 0.85, playfulnessScore: 0.82, professionalismScore: 0.88, conciseness: 0.92,
            verbosity: 0.65, conversationalTone: 0.88, formalTone: 0.85,
            lateNightSuitability: 0.92, workHoursSuitability: 0.9,
        },
        specializations: ['fast_tasks', 'budget', 'classification'],
        accessTier: AccessTier.Free, creditCost: 4,
        toolPricing: { webSearchPer1k: 10.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Claude Haiku 3.5 (ANTHROPIC)
    // ---------------------------------------------------------------
    {
        id: 'claude-3-5-haiku-20241022', name: 'Claude Haiku 3.5', provider: 'anthropic',
        description: 'Budget Claude for simple tasks and high-volume classification. 200K context, 8K output.',
        pricing: { inputPer1k: 0.0008, outputPer1k: 0.004, cachedInputPer1k: 8e-05 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 8192,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.82, audioScore: 0,
        },
        performance: { avgLatencyMs: 350, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.75, [Intent.Creative]: 0.72, [Intent.Analysis]: 0.73, [Intent.Factual]: 0.76,
                [Intent.Conversation]: 0.82, [Intent.Task]: 0.73, [Intent.Brainstorm]: 0.7, [Intent.Translation]: 0.72,
                [Intent.Summarization]: 0.76, [Intent.Extraction]: 0.74,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.65, [Intent.Math]: 0.68, [Intent.Planning]: 0.66,
            },
            domains: {
                [Domain.Technology]: 0.75, [Domain.Business]: 0.72, [Domain.Health]: 0.7, [Domain.Legal]: 0.68,
                [Domain.Finance]: 0.7, [Domain.Education]: 0.74, [Domain.Science]: 0.73, [Domain.CreativeArts]: 0.72,
                [Domain.Lifestyle]: 0.74, [Domain.General]: 0.78, [Domain.Government]: 0.66, [Domain.Relationships]: 0.7,
                [Domain.Shopping]: 0.7, [Domain.EventPlanning]: 0.66, [Domain.Weather]: 0.66, [Domain.Sports]: 0.68,
            },
            complexity: { [Complexity.Quick]: 0.95, [Complexity.Standard]: 0.78, [Complexity.Demanding]: 0.58 },
        },
        humanFactors: {
            empathyScore: 0.8, playfulnessScore: 0.78, professionalismScore: 0.82, conciseness: 0.94,
            verbosity: 0.55, conversationalTone: 0.85, formalTone: 0.8,
            lateNightSuitability: 0.92, workHoursSuitability: 0.85,
        },
        specializations: ['fast_tasks', 'budget', 'classification'],
        accessTier: AccessTier.Free, creditCost: 2,
        toolPricing: { webSearchPer1k: 10.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-5.2 (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-5.2', name: 'GPT-5.2', provider: 'openai',
        description: 'OpenAI flagship for coding and agentic tasks. Configurable reasoning effort. 400K context, 128K output.',
        pricing: { inputPer1k: 0.00175, outputPer1k: 0.014, cachedInputPer1k: 0.000175 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.95, audioScore: 0,
        },
        performance: { avgLatencyMs: 2000, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.95, [Intent.Creative]: 0.85, [Intent.Analysis]: 0.96, [Intent.Factual]: 0.93,
                [Intent.Conversation]: 0.82, [Intent.Task]: 0.94, [Intent.Brainstorm]: 0.88, [Intent.Translation]: 0.88,
                [Intent.Summarization]: 0.91, [Intent.Extraction]: 0.93,
                [Intent.ImageGeneration]: 0.7, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.9, [Intent.Math]: 0.96, [Intent.Planning]: 0.9,
            },
            domains: {
                [Domain.Technology]: 0.96, [Domain.Business]: 0.91, [Domain.Health]: 0.88, [Domain.Legal]: 0.9,
                [Domain.Finance]: 0.93, [Domain.Education]: 0.91, [Domain.Science]: 0.96, [Domain.CreativeArts]: 0.83,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.91, [Domain.Government]: 0.9, [Domain.Relationships]: 0.75,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.78, [Domain.Weather]: 0.74, [Domain.Sports]: 0.76,
            },
            complexity: { [Complexity.Quick]: 0.76, [Complexity.Standard]: 0.93, [Complexity.Demanding]: 0.98 },
        },
        humanFactors: {
            empathyScore: 0.88, playfulnessScore: 0.82, professionalismScore: 0.96, conciseness: 0.76,
            verbosity: 0.88, conversationalTone: 0.85, formalTone: 0.95,
            lateNightSuitability: 0.82, workHoursSuitability: 0.96,
        },
        specializations: ['reasoning', 'coding', 'math', 'agentic'],
        accessTier: AccessTier.Pro, creditCost: 10,
        toolPricing: { webSearchPer1k: 10.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-5.2 Pro (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', provider: 'openai',
        description: 'Premium GPT-5.2 with more compute. Smarter, more precise responses. For research and cutting-edge work. 400K context.',
        pricing: { inputPer1k: 0.021, outputPer1k: 0.168 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.96, audioScore: 0,
        },
        performance: { avgLatencyMs: 8000, reliabilityPercent: 99.3 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.93, [Intent.Creative]: 0.82, [Intent.Analysis]: 0.97, [Intent.Factual]: 0.94,
                [Intent.Conversation]: 0.78, [Intent.Task]: 0.95, [Intent.Brainstorm]: 0.9, [Intent.Translation]: 0.89,
                [Intent.Summarization]: 0.93, [Intent.Extraction]: 0.95,
                [Intent.ImageGeneration]: 0.7, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.92, [Intent.Math]: 0.98, [Intent.Planning]: 0.91,
            },
            domains: {
                [Domain.Technology]: 0.97, [Domain.Business]: 0.93, [Domain.Health]: 0.92, [Domain.Legal]: 0.93,
                [Domain.Finance]: 0.95, [Domain.Education]: 0.93, [Domain.Science]: 0.97, [Domain.CreativeArts]: 0.8,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.9, [Domain.Government]: 0.92, [Domain.Relationships]: 0.73,
                [Domain.Shopping]: 0.7, [Domain.EventPlanning]: 0.76, [Domain.Weather]: 0.73, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.62, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.99 },
        },
        humanFactors: {
            empathyScore: 0.82, playfulnessScore: 0.75, professionalismScore: 0.98, conciseness: 0.65,
            verbosity: 0.92, conversationalTone: 0.78, formalTone: 0.97,
            lateNightSuitability: 0.75, workHoursSuitability: 0.96,
        },
        specializations: ['reasoning', 'math', 'research', 'ultra_premium'],
        accessTier: AccessTier.Premium, creditCost: 50, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-5 (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-5', name: 'GPT-5', provider: 'openai',
        description: 'Previous intelligent reasoning model. Configurable reasoning effort. 400K context, 128K output.',
        pricing: { inputPer1k: 0.00125, outputPer1k: 0.01, cachedInputPer1k: 0.000125 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.92, audioScore: 0,
        },
        performance: { avgLatencyMs: 2400, reliabilityPercent: 99.4 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.9, [Intent.Creative]: 0.82, [Intent.Analysis]: 0.9, [Intent.Factual]: 0.88,
                [Intent.Conversation]: 0.85, [Intent.Task]: 0.9, [Intent.Brainstorm]: 0.85, [Intent.Translation]: 0.84,
                [Intent.Summarization]: 0.87, [Intent.Extraction]: 0.89,
                [Intent.ImageGeneration]: 0.65, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.82, [Intent.Math]: 0.86, [Intent.Planning]: 0.87,
            },
            domains: {
                [Domain.Technology]: 0.91, [Domain.Business]: 0.87, [Domain.Health]: 0.84, [Domain.Legal]: 0.86,
                [Domain.Finance]: 0.88, [Domain.Education]: 0.87, [Domain.Science]: 0.9, [Domain.CreativeArts]: 0.82,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.88, [Domain.Government]: 0.84, [Domain.Relationships]: 0.8,
                [Domain.Shopping]: 0.77, [Domain.EventPlanning]: 0.8, [Domain.Weather]: 0.74, [Domain.Sports]: 0.76,
            },
            complexity: { [Complexity.Quick]: 0.74, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.94 },
        },
        humanFactors: {
            empathyScore: 0.84, playfulnessScore: 0.78, professionalismScore: 0.92, conciseness: 0.76,
            verbosity: 0.84, conversationalTone: 0.82, formalTone: 0.92,
            lateNightSuitability: 0.78, workHoursSuitability: 0.92,
        },
        specializations: ['general_purpose', 'reasoning'],
        accessTier: AccessTier.Pro, creditCost: 8,
        toolPricing: { webSearchPer1k: 10.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-5 Mini (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai',
        description: 'Fast, cost-efficient reasoning. Great balance of power and cost. 400K context.',
        pricing: { inputPer1k: 0.00025, outputPer1k: 0.002, cachedInputPer1k: 2.5e-05 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 800, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.84, [Intent.Creative]: 0.78, [Intent.Analysis]: 0.83, [Intent.Factual]: 0.85,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.84, [Intent.Brainstorm]: 0.78, [Intent.Translation]: 0.82,
                [Intent.Summarization]: 0.85, [Intent.Extraction]: 0.86,
                [Intent.ImageGeneration]: 0.55, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
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
            empathyScore: 0.84, playfulnessScore: 0.8, professionalismScore: 0.9, conciseness: 0.87,
            verbosity: 0.75, conversationalTone: 0.85, formalTone: 0.88,
            lateNightSuitability: 0.87, workHoursSuitability: 0.92,
        },
        specializations: ['fast_tasks', 'general_purpose', 'reasoning'],
        accessTier: AccessTier.Free, creditCost: 2,
        toolPricing: { webSearchPer1k: 10.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-5 Nano (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai',
        description: 'Fastest, cheapest reasoning model. Summarization, classification, extraction. 400K context.',
        pricing: { inputPer1k: 5e-05, outputPer1k: 0.0004, cachedInputPer1k: 5e-06 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.82, audioScore: 0,
        },
        performance: { avgLatencyMs: 400, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.72, [Intent.Creative]: 0.68, [Intent.Analysis]: 0.73, [Intent.Factual]: 0.78,
                [Intent.Conversation]: 0.8, [Intent.Task]: 0.76, [Intent.Brainstorm]: 0.66, [Intent.Translation]: 0.75,
                [Intent.Summarization]: 0.82, [Intent.Extraction]: 0.84,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.62, [Intent.Math]: 0.65, [Intent.Planning]: 0.63,
            },
            domains: {
                [Domain.Technology]: 0.74, [Domain.Business]: 0.72, [Domain.Health]: 0.7, [Domain.Legal]: 0.68,
                [Domain.Finance]: 0.72, [Domain.Education]: 0.76, [Domain.Science]: 0.73, [Domain.CreativeArts]: 0.66,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.8, [Domain.Government]: 0.63, [Domain.Relationships]: 0.68,
                [Domain.Shopping]: 0.7, [Domain.EventPlanning]: 0.63, [Domain.Weather]: 0.65, [Domain.Sports]: 0.66,
            },
            complexity: { [Complexity.Quick]: 0.97, [Complexity.Standard]: 0.8, [Complexity.Demanding]: 0.62 },
        },
        humanFactors: {
            empathyScore: 0.72, playfulnessScore: 0.7, professionalismScore: 0.85, conciseness: 0.94,
            verbosity: 0.55, conversationalTone: 0.82, formalTone: 0.82,
            lateNightSuitability: 0.9, workHoursSuitability: 0.88,
        },
        specializations: ['fast_tasks', 'budget', 'summarization', 'classification'],
        accessTier: AccessTier.Free, creditCost: 1, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-4.1 (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai',
        description: 'Strong coding and instruction-following. 1M context window. Great for large codebases and long documents.',
        pricing: { inputPer1k: 0.002, outputPer1k: 0.008, cachedInputPer1k: 0.0005 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.9, audioScore: 0,
        },
        performance: { avgLatencyMs: 1200, reliabilityPercent: 99.6 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.92, [Intent.Creative]: 0.8, [Intent.Analysis]: 0.9, [Intent.Factual]: 0.88,
                [Intent.Conversation]: 0.84, [Intent.Task]: 0.91, [Intent.Brainstorm]: 0.82, [Intent.Translation]: 0.85,
                [Intent.Summarization]: 0.88, [Intent.Extraction]: 0.9,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.78, [Intent.Math]: 0.82, [Intent.Planning]: 0.84,
            },
            domains: {
                [Domain.Technology]: 0.93, [Domain.Business]: 0.86, [Domain.Health]: 0.83, [Domain.Legal]: 0.84,
                [Domain.Finance]: 0.86, [Domain.Education]: 0.87, [Domain.Science]: 0.88, [Domain.CreativeArts]: 0.79,
                [Domain.Lifestyle]: 0.78, [Domain.General]: 0.87, [Domain.Government]: 0.82, [Domain.Relationships]: 0.74,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.75, [Domain.Weather]: 0.7, [Domain.Sports]: 0.72,
            },
            complexity: { [Complexity.Quick]: 0.84, [Complexity.Standard]: 0.92, [Complexity.Demanding]: 0.9 },
        },
        humanFactors: {
            empathyScore: 0.84, playfulnessScore: 0.78, professionalismScore: 0.93, conciseness: 0.82,
            verbosity: 0.8, conversationalTone: 0.83, formalTone: 0.92,
            lateNightSuitability: 0.82, workHoursSuitability: 0.94,
        },
        specializations: ['coding', 'instruction_following', 'long_context'],
        accessTier: AccessTier.Pro, creditCost: 8, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-4.1 Mini (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai',
        description: 'Fast, affordable with 1M context. Balanced performance for everyday tasks and coding.',
        pricing: { inputPer1k: 0.0004, outputPer1k: 0.0016, cachedInputPer1k: 0.0001 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.85, audioScore: 0,
        },
        performance: { avgLatencyMs: 600, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.82, [Intent.Creative]: 0.78, [Intent.Analysis]: 0.80, [Intent.Factual]: 0.83,
                [Intent.Conversation]: 0.85, [Intent.Task]: 0.82, [Intent.Brainstorm]: 0.76, [Intent.Translation]: 0.80,
                [Intent.Summarization]: 0.83, [Intent.Extraction]: 0.82,
                [Intent.ImageGeneration]: 0.08, [Intent.VideoGeneration]: 0.06,
                [Intent.VoiceGeneration]: 0.05, [Intent.MusicGeneration]: 0.05,
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
            empathyScore: 0.8, playfulnessScore: 0.76, professionalismScore: 0.88, conciseness: 0.88,
            verbosity: 0.7, conversationalTone: 0.84, formalTone: 0.86,
            lateNightSuitability: 0.88, workHoursSuitability: 0.9,
        },
        specializations: ['fast_tasks', 'budget', 'long_context'],
        accessTier: AccessTier.Free, creditCost: 2, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-4.1 Nano (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'openai',
        description: 'Cheapest GPT-4 class model. 1M context. For classification, extraction, and simple tasks.',
        pricing: { inputPer1k: 0.0001, outputPer1k: 0.0004, cachedInputPer1k: 2.5e-05 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.8, audioScore: 0,
        },
        performance: { avgLatencyMs: 350, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.70, [Intent.Creative]: 0.65, [Intent.Analysis]: 0.68, [Intent.Factual]: 0.74,
                [Intent.Conversation]: 0.78, [Intent.Task]: 0.72, [Intent.Brainstorm]: 0.63, [Intent.Translation]: 0.72,
                [Intent.Summarization]: 0.78, [Intent.Extraction]: 0.80,
                [Intent.ImageGeneration]: 0.05, [Intent.VideoGeneration]: 0.04,
                [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.58, [Intent.Math]: 0.62, [Intent.Planning]: 0.60,
            },
            domains: {
                [Domain.Technology]: 0.72, [Domain.Business]: 0.7, [Domain.Health]: 0.68, [Domain.Legal]: 0.66,
                [Domain.Finance]: 0.7, [Domain.Education]: 0.74, [Domain.Science]: 0.71, [Domain.CreativeArts]: 0.64,
                [Domain.Lifestyle]: 0.74, [Domain.General]: 0.78, [Domain.Government]: 0.62, [Domain.Relationships]: 0.66,
                [Domain.Shopping]: 0.68, [Domain.EventPlanning]: 0.62, [Domain.Weather]: 0.64, [Domain.Sports]: 0.64,
            },
            complexity: { [Complexity.Quick]: 0.96, [Complexity.Standard]: 0.78, [Complexity.Demanding]: 0.55 },
        },
        humanFactors: {
            empathyScore: 0.7, playfulnessScore: 0.68, professionalismScore: 0.84, conciseness: 0.95,
            verbosity: 0.52, conversationalTone: 0.8, formalTone: 0.82,
            lateNightSuitability: 0.9, workHoursSuitability: 0.86,
        },
        specializations: ['fast_tasks', 'budget', 'classification', 'long_context'],
        accessTier: AccessTier.Free, creditCost: 1, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-4o (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-4o', name: 'GPT-4o', provider: 'openai',
        description: 'Multimodal powerhouse with vision, audio, and native image generation. Fast and versatile. 128K context.',
        pricing: { inputPer1k: 0.0025, outputPer1k: 0.01, cachedInputPer1k: 0.000625 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 16384,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.93, audioScore: 0.85,
        },
        performance: { avgLatencyMs: 800, reliabilityPercent: 99.6 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.88, [Intent.Creative]: 0.85, [Intent.Analysis]: 0.87, [Intent.Factual]: 0.86,
                [Intent.Conversation]: 0.9, [Intent.Task]: 0.88, [Intent.Brainstorm]: 0.84, [Intent.Translation]: 0.87,
                [Intent.Summarization]: 0.86, [Intent.Extraction]: 0.87,
                [Intent.ImageGeneration]: 0.75, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.76, [Intent.Math]: 0.8, [Intent.Planning]: 0.82,
            },
            domains: {
                [Domain.Technology]: 0.9, [Domain.Business]: 0.85, [Domain.Health]: 0.82, [Domain.Legal]: 0.83,
                [Domain.Finance]: 0.85, [Domain.Education]: 0.88, [Domain.Science]: 0.87, [Domain.CreativeArts]: 0.86,
                [Domain.Lifestyle]: 0.85, [Domain.General]: 0.9, [Domain.Government]: 0.8, [Domain.Relationships]: 0.82,
                [Domain.Shopping]: 0.78, [Domain.EventPlanning]: 0.8, [Domain.Weather]: 0.74, [Domain.Sports]: 0.78,
            },
            complexity: { [Complexity.Quick]: 0.9, [Complexity.Standard]: 0.9, [Complexity.Demanding]: 0.82 },
        },
        humanFactors: {
            empathyScore: 0.88, playfulnessScore: 0.85, professionalismScore: 0.92, conciseness: 0.84,
            verbosity: 0.78, conversationalTone: 0.9, formalTone: 0.9,
            lateNightSuitability: 0.88, workHoursSuitability: 0.94,
        },
        specializations: ['multimodal', 'creative_writing', 'audio_processing'],
        accessTier: AccessTier.Pro, creditCost: 8, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-4o Mini (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai',
        description: 'Affordable multimodal model with native image generation. Fast for everyday tasks. 128K context.',
        pricing: { inputPer1k: 0.00015, outputPer1k: 0.0006, cachedInputPer1k: 3.75e-05 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 16384,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.85, audioScore: 0.78,
        },
        performance: { avgLatencyMs: 500, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.78, [Intent.Creative]: 0.74, [Intent.Analysis]: 0.76, [Intent.Factual]: 0.78,
                [Intent.Conversation]: 0.85, [Intent.Task]: 0.78, [Intent.Brainstorm]: 0.72, [Intent.Translation]: 0.8,
                [Intent.Summarization]: 0.8, [Intent.Extraction]: 0.8,
                [Intent.ImageGeneration]: 0.50, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.64, [Intent.Math]: 0.68, [Intent.Planning]: 0.7,
            },
            domains: {
                [Domain.Technology]: 0.78, [Domain.Business]: 0.74, [Domain.Health]: 0.72, [Domain.Legal]: 0.7,
                [Domain.Finance]: 0.74, [Domain.Education]: 0.78, [Domain.Science]: 0.76, [Domain.CreativeArts]: 0.74,
                [Domain.Lifestyle]: 0.78, [Domain.General]: 0.82, [Domain.Government]: 0.68, [Domain.Relationships]: 0.74,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.7, [Domain.Weather]: 0.68, [Domain.Sports]: 0.7,
            },
            complexity: { [Complexity.Quick]: 0.94, [Complexity.Standard]: 0.82, [Complexity.Demanding]: 0.66 },
        },
        humanFactors: {
            empathyScore: 0.8, playfulnessScore: 0.78, professionalismScore: 0.85, conciseness: 0.9,
            verbosity: 0.65, conversationalTone: 0.86, formalTone: 0.84,
            lateNightSuitability: 0.9, workHoursSuitability: 0.88,
        },
        specializations: ['fast_tasks', 'multimodal', 'budget'],
        accessTier: AccessTier.Free, creditCost: 1, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-5.2 Codex (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', provider: 'openai',
        description: 'Premium agentic coding model. Best-in-class for complex multi-file coding tasks. Runs in cloud sandbox.',
        pricing: { inputPer1k: 0.00175, outputPer1k: 0.014, cachedInputPer1k: 0.000175 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: true, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.9, audioScore: 0,
        },
        performance: { avgLatencyMs: 3000, reliabilityPercent: 99.4 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.98, [Intent.Creative]: 0.7, [Intent.Analysis]: 0.92, [Intent.Factual]: 0.85,
                [Intent.Conversation]: 0.7, [Intent.Task]: 0.95, [Intent.Brainstorm]: 0.78, [Intent.Translation]: 0.75,
                [Intent.Summarization]: 0.82, [Intent.Extraction]: 0.88,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.8, [Intent.Math]: 0.9, [Intent.Planning]: 0.88,
            },
            domains: {
                [Domain.Technology]: 0.98, [Domain.Business]: 0.82, [Domain.Health]: 0.75, [Domain.Legal]: 0.78,
                [Domain.Finance]: 0.84, [Domain.Education]: 0.82, [Domain.Science]: 0.88, [Domain.CreativeArts]: 0.68,
                [Domain.Lifestyle]: 0.65, [Domain.General]: 0.8, [Domain.Government]: 0.76, [Domain.Relationships]: 0.6,
                [Domain.Shopping]: 0.6, [Domain.EventPlanning]: 0.65, [Domain.Weather]: 0.6, [Domain.Sports]: 0.6,
            },
            complexity: { [Complexity.Quick]: 0.7, [Complexity.Standard]: 0.9, [Complexity.Demanding]: 0.99 },
        },
        humanFactors: {
            empathyScore: 0.7, playfulnessScore: 0.6, professionalismScore: 0.96, conciseness: 0.72,
            verbosity: 0.88, conversationalTone: 0.7, formalTone: 0.95,
            lateNightSuitability: 0.75, workHoursSuitability: 0.96,
        },
        specializations: ['coding', 'agentic_coding'],
        accessTier: AccessTier.Premium, creditCost: 30, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-5.1 Codex Mini (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini', provider: 'openai',
        description: 'Fast agentic coding model. Efficient for everyday coding tasks and code review.',
        pricing: { inputPer1k: 0.00025, outputPer1k: 0.002, cachedInputPer1k: 2.5e-05 },
        capabilities: {
            maxInputTokens: 400000, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: true, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.85, audioScore: 0,
        },
        performance: { avgLatencyMs: 800, reliabilityPercent: 99.7 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.92, [Intent.Creative]: 0.50, [Intent.Analysis]: 0.72, [Intent.Factual]: 0.68,
                [Intent.Conversation]: 0.48, [Intent.Task]: 0.78, [Intent.Brainstorm]: 0.58, [Intent.Translation]: 0.55,
                [Intent.Summarization]: 0.68, [Intent.Extraction]: 0.75,
                [Intent.ImageGeneration]: 0.06, [Intent.VideoGeneration]: 0.05,
                [Intent.VoiceGeneration]: 0.03, [Intent.MusicGeneration]: 0.03,
                [Intent.Research]: 0.52, [Intent.Math]: 0.82, [Intent.Planning]: 0.62,
            },
            domains: {
                [Domain.Technology]: 0.94, [Domain.Business]: 0.58, [Domain.Health]: 0.48, [Domain.Legal]: 0.48,
                [Domain.Finance]: 0.55, [Domain.Education]: 0.62, [Domain.Science]: 0.75, [Domain.CreativeArts]: 0.40,
                [Domain.Lifestyle]: 0.38, [Domain.General]: 0.58, [Domain.Government]: 0.44, [Domain.Relationships]: 0.32,
                [Domain.Shopping]: 0.32, [Domain.EventPlanning]: 0.35, [Domain.Weather]: 0.32, [Domain.Sports]: 0.32,
            },
            complexity: { [Complexity.Quick]: 0.82, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.9 },
        },
        humanFactors: {
            empathyScore: 0.65, playfulnessScore: 0.58, professionalismScore: 0.92, conciseness: 0.8,
            verbosity: 0.78, conversationalTone: 0.66, formalTone: 0.92,
            lateNightSuitability: 0.78, workHoursSuitability: 0.94,
        },
        specializations: ['coding', 'agentic_coding'],
        accessTier: AccessTier.Free, creditCost: 3, available: true,
    },
    // ---------------------------------------------------------------
    // o3 Deep Research (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'o3-deep-research', name: 'o3 Deep Research', provider: 'openai',
        description: 'Premium deep research model. Browses the web, synthesizes comprehensive reports. 200K context.',
        pricing: { inputPer1k: 0.01, outputPer1k: 0.04 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 100000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 30000, reliabilityPercent: 98.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.75, [Intent.Creative]: 0.72, [Intent.Analysis]: 0.96, [Intent.Factual]: 0.97,
                [Intent.Conversation]: 0.7, [Intent.Task]: 0.85, [Intent.Brainstorm]: 0.82, [Intent.Translation]: 0.75,
                [Intent.Summarization]: 0.92, [Intent.Extraction]: 0.9,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.99, [Intent.Math]: 0.88, [Intent.Planning]: 0.9,
            },
            domains: {
                [Domain.Technology]: 0.92, [Domain.Business]: 0.9, [Domain.Health]: 0.92, [Domain.Legal]: 0.9,
                [Domain.Finance]: 0.92, [Domain.Education]: 0.9, [Domain.Science]: 0.95, [Domain.CreativeArts]: 0.72,
                [Domain.Lifestyle]: 0.78, [Domain.General]: 0.88, [Domain.Government]: 0.88, [Domain.Relationships]: 0.7,
                [Domain.Shopping]: 0.75, [Domain.EventPlanning]: 0.72, [Domain.Weather]: 0.7, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.5, [Complexity.Standard]: 0.8, [Complexity.Demanding]: 0.98 },
        },
        humanFactors: {
            empathyScore: 0.72, playfulnessScore: 0.6, professionalismScore: 0.96, conciseness: 0.55,
            verbosity: 0.95, conversationalTone: 0.68, formalTone: 0.95,
            lateNightSuitability: 0.65, workHoursSuitability: 0.95,
        },
        specializations: ['deep_research', 'research', 'comprehensive_reports'],
        accessTier: AccessTier.Premium, creditCost: 50, available: true,
    },
    // ---------------------------------------------------------------
    // o4-mini Deep Research (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'o4-mini-deep-research', name: 'o4-mini Deep Research', provider: 'openai',
        description: 'Efficient deep research model. Web browsing and report synthesis at lower cost.',
        pricing: { inputPer1k: 0.0011, outputPer1k: 0.0044, cachedInputPer1k: 0.000275 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 100000,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.85, audioScore: 0,
        },
        performance: { avgLatencyMs: 15000, reliabilityPercent: 99.0 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.7, [Intent.Creative]: 0.68, [Intent.Analysis]: 0.9, [Intent.Factual]: 0.92,
                [Intent.Conversation]: 0.68, [Intent.Task]: 0.8, [Intent.Brainstorm]: 0.78, [Intent.Translation]: 0.72,
                [Intent.Summarization]: 0.88, [Intent.Extraction]: 0.86,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.94, [Intent.Math]: 0.82, [Intent.Planning]: 0.84,
            },
            domains: {
                [Domain.Technology]: 0.88, [Domain.Business]: 0.85, [Domain.Health]: 0.87, [Domain.Legal]: 0.85,
                [Domain.Finance]: 0.87, [Domain.Education]: 0.86, [Domain.Science]: 0.9, [Domain.CreativeArts]: 0.68,
                [Domain.Lifestyle]: 0.74, [Domain.General]: 0.84, [Domain.Government]: 0.84, [Domain.Relationships]: 0.66,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.68, [Domain.Weather]: 0.66, [Domain.Sports]: 0.7,
            },
            complexity: { [Complexity.Quick]: 0.55, [Complexity.Standard]: 0.82, [Complexity.Demanding]: 0.92 },
        },
        humanFactors: {
            empathyScore: 0.7, playfulnessScore: 0.58, professionalismScore: 0.94, conciseness: 0.6,
            verbosity: 0.9, conversationalTone: 0.66, formalTone: 0.93,
            lateNightSuitability: 0.68, workHoursSuitability: 0.94,
        },
        specializations: ['deep_research', 'research'],
        accessTier: AccessTier.Pro, creditCost: 15, available: true,
    },
    // ---------------------------------------------------------------
    // GPT Image 1.5 (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-image-1.5', name: 'GPT Image 1.5', provider: 'openai',
        description: 'Premium image generation model. Best quality from OpenAI. Photorealistic and artistic styles.',
        pricing: { inputPer1k: 0.005, outputPer1k: 0.04 },
        capabilities: {
            maxInputTokens: 32000, maxOutputTokens: 4096,
            supportsStreaming: false, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.92, audioScore: 0,
        },
        performance: { avgLatencyMs: 8000, reliabilityPercent: 99.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.1, [Intent.Creative]: 0.95, [Intent.Analysis]: 0.2, [Intent.Factual]: 0.15,
                [Intent.Conversation]: 0.1, [Intent.Task]: 0.4, [Intent.Brainstorm]: 0.5, [Intent.Translation]: 0.05,
                [Intent.Summarization]: 0.05, [Intent.Extraction]: 0.1,
                [Intent.ImageGeneration]: 0.98, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.05, [Intent.Math]: 0.05, [Intent.Planning]: 0.1,
            },
            domains: {
                [Domain.Technology]: 0.6, [Domain.Business]: 0.7, [Domain.Health]: 0.55, [Domain.Legal]: 0.3,
                [Domain.Finance]: 0.45, [Domain.Education]: 0.65, [Domain.Science]: 0.6, [Domain.CreativeArts]: 0.98,
                [Domain.Lifestyle]: 0.85, [Domain.General]: 0.8, [Domain.Government]: 0.35, [Domain.Relationships]: 0.5,
                [Domain.Shopping]: 0.75, [Domain.EventPlanning]: 0.7, [Domain.Weather]: 0.4, [Domain.Sports]: 0.55,
            },
            complexity: { [Complexity.Quick]: 0.85, [Complexity.Standard]: 0.9, [Complexity.Demanding]: 0.75 },
        },
        humanFactors: {
            empathyScore: 0.5, playfulnessScore: 0.85, professionalismScore: 0.88, conciseness: 0.95,
            verbosity: 0.2, conversationalTone: 0.4, formalTone: 0.7,
            lateNightSuitability: 0.85, workHoursSuitability: 0.9,
        },
        specializations: ['image_generation', 'image_editing'],
        accessTier: AccessTier.Pro, creditCost: 8, available: true,
    },
    // ---------------------------------------------------------------
    // GPT Image 1 Mini (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-image-1-mini', name: 'GPT Image 1 Mini', provider: 'openai',
        description: 'Fast affordable image generation. Good quality at lower cost.',
        pricing: { inputPer1k: 0.001675, outputPer1k: 0.006675 },
        capabilities: {
            maxInputTokens: 32000, maxOutputTokens: 4096,
            supportsStreaming: false, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.85, audioScore: 0,
        },
        performance: { avgLatencyMs: 5000, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.08, [Intent.Creative]: 0.88, [Intent.Analysis]: 0.15, [Intent.Factual]: 0.12,
                [Intent.Conversation]: 0.08, [Intent.Task]: 0.35, [Intent.Brainstorm]: 0.45, [Intent.Translation]: 0.04,
                [Intent.Summarization]: 0.04, [Intent.Extraction]: 0.08,
                [Intent.ImageGeneration]: 0.90, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.04, [Intent.Math]: 0.04, [Intent.Planning]: 0.08,
            },
            domains: {
                [Domain.Technology]: 0.55, [Domain.Business]: 0.65, [Domain.Health]: 0.5, [Domain.Legal]: 0.25,
                [Domain.Finance]: 0.4, [Domain.Education]: 0.6, [Domain.Science]: 0.55, [Domain.CreativeArts]: 0.92,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.75, [Domain.Government]: 0.3, [Domain.Relationships]: 0.45,
                [Domain.Shopping]: 0.7, [Domain.EventPlanning]: 0.65, [Domain.Weather]: 0.35, [Domain.Sports]: 0.5,
            },
            complexity: { [Complexity.Quick]: 0.9, [Complexity.Standard]: 0.85, [Complexity.Demanding]: 0.65 },
        },
        humanFactors: {
            empathyScore: 0.48, playfulnessScore: 0.82, professionalismScore: 0.82, conciseness: 0.95,
            verbosity: 0.18, conversationalTone: 0.38, formalTone: 0.68,
            lateNightSuitability: 0.88, workHoursSuitability: 0.88,
        },
        specializations: ['image_generation', 'budget'],
        accessTier: AccessTier.Free, creditCost: 4, available: true,
    },
    // ---------------------------------------------------------------
    // Sora 2 (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'sora-2', name: 'Sora 2', provider: 'openai',
        description: 'State-of-the-art video generation. Text-to-video and image-to-video with cinematic quality.',
        pricing: { inputPer1k: 0.015, outputPer1k: 0.06 },
        capabilities: {
            maxInputTokens: 16000, maxOutputTokens: 4096,
            supportsStreaming: false, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: true, supportsRealtimeAudio: false,
            visionScore: 0.9, audioScore: 0,
        },
        performance: { avgLatencyMs: 60000, reliabilityPercent: 97.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.92, [Intent.Analysis]: 0.1, [Intent.Factual]: 0.05,
                [Intent.Conversation]: 0.05, [Intent.Task]: 0.3, [Intent.Brainstorm]: 0.4, [Intent.Translation]: 0.0,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.3, [Intent.VideoGeneration]: 0.97,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.1,
            },
            domains: {
                [Domain.Technology]: 0.5, [Domain.Business]: 0.65, [Domain.Health]: 0.4, [Domain.Legal]: 0.2,
                [Domain.Finance]: 0.35, [Domain.Education]: 0.6, [Domain.Science]: 0.5, [Domain.CreativeArts]: 0.97,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.7, [Domain.Government]: 0.25, [Domain.Relationships]: 0.45,
                [Domain.Shopping]: 0.65, [Domain.EventPlanning]: 0.6, [Domain.Weather]: 0.3, [Domain.Sports]: 0.55,
            },
            complexity: { [Complexity.Quick]: 0.6, [Complexity.Standard]: 0.8, [Complexity.Demanding]: 0.85 },
        },
        humanFactors: {
            empathyScore: 0.4, playfulnessScore: 0.8, professionalismScore: 0.85, conciseness: 0.95,
            verbosity: 0.1, conversationalTone: 0.3, formalTone: 0.65,
            lateNightSuitability: 0.8, workHoursSuitability: 0.85,
        },
        specializations: ['video_generation'],
        accessTier: AccessTier.Premium, creditCost: 100, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-4o Mini TTS (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-4o-mini-tts', name: 'GPT-4o Mini TTS', provider: 'openai',
        description: 'Text-to-speech with natural voice output. Multiple voices and styles.',
        pricing: { inputPer1k: 0.0006, outputPer1k: 0.0024 },
        capabilities: {
            maxInputTokens: 16000, maxOutputTokens: 8000,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: true, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.92,
        },
        performance: { avgLatencyMs: 600, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.6, [Intent.Analysis]: 0.0, [Intent.Factual]: 0.0,
                [Intent.Conversation]: 0.3, [Intent.Task]: 0.5, [Intent.Brainstorm]: 0.1, [Intent.Translation]: 0.3,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.96, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.3, [Domain.Business]: 0.5, [Domain.Health]: 0.4, [Domain.Legal]: 0.3,
                [Domain.Finance]: 0.35, [Domain.Education]: 0.65, [Domain.Science]: 0.35, [Domain.CreativeArts]: 0.75,
                [Domain.Lifestyle]: 0.6, [Domain.General]: 0.6, [Domain.Government]: 0.3, [Domain.Relationships]: 0.45,
                [Domain.Shopping]: 0.4, [Domain.EventPlanning]: 0.45, [Domain.Weather]: 0.3, [Domain.Sports]: 0.35,
            },
            complexity: { [Complexity.Quick]: 0.9, [Complexity.Standard]: 0.75, [Complexity.Demanding]: 0.4 },
        },
        humanFactors: {
            empathyScore: 0.7, playfulnessScore: 0.65, professionalismScore: 0.85, conciseness: 0.9,
            verbosity: 0.3, conversationalTone: 0.75, formalTone: 0.8,
            lateNightSuitability: 0.85, workHoursSuitability: 0.9,
        },
        specializations: ['tts', 'voice_generation'],
        accessTier: AccessTier.Pro, creditCost: 3, available: true,
    },
    // ---------------------------------------------------------------
    // GPT-4o Mini Transcribe (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-4o-mini-transcribe', name: 'GPT-4o Mini Transcribe', provider: 'openai',
        description: 'Speech-to-text transcription. Fast and accurate audio transcription with language detection.',
        pricing: { inputPer1k: 0.0003, outputPer1k: 0.0012 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 16384,
            supportsStreaming: true, supportsVision: false, supportsAudio: true,
            supportsFunctionCalling: false, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: true,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.9,
        },
        performance: { avgLatencyMs: 400, reliabilityPercent: 99.6 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.1, [Intent.Analysis]: 0.1, [Intent.Factual]: 0.1,
                [Intent.Conversation]: 0.2, [Intent.Task]: 0.6, [Intent.Brainstorm]: 0.05, [Intent.Translation]: 0.5,
                [Intent.Summarization]: 0.3, [Intent.Extraction]: 0.7,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.4, [Domain.Business]: 0.6, [Domain.Health]: 0.55, [Domain.Legal]: 0.55,
                [Domain.Finance]: 0.5, [Domain.Education]: 0.6, [Domain.Science]: 0.45, [Domain.CreativeArts]: 0.5,
                [Domain.Lifestyle]: 0.55, [Domain.General]: 0.6, [Domain.Government]: 0.5, [Domain.Relationships]: 0.4,
                [Domain.Shopping]: 0.4, [Domain.EventPlanning]: 0.45, [Domain.Weather]: 0.3, [Domain.Sports]: 0.4,
            },
            complexity: { [Complexity.Quick]: 0.92, [Complexity.Standard]: 0.78, [Complexity.Demanding]: 0.45 },
        },
        humanFactors: {
            empathyScore: 0.4, playfulnessScore: 0.3, professionalismScore: 0.88, conciseness: 0.95,
            verbosity: 0.2, conversationalTone: 0.4, formalTone: 0.85,
            lateNightSuitability: 0.85, workHoursSuitability: 0.92,
        },
        specializations: ['stt', 'transcription'],
        accessTier: AccessTier.Pro, creditCost: 2, available: true,
    },
    // ---------------------------------------------------------------
    // GPT Realtime (OPENAI)
    // ---------------------------------------------------------------
    {
        id: 'gpt-realtime', name: 'GPT Realtime', provider: 'openai',
        description: 'Realtime audio-to-audio model. Voice conversations with low latency.',
        pricing: { inputPer1k: 0.04, outputPer1k: 0.08 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 16384,
            supportsStreaming: true, supportsVision: false, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: true, supportsSTT: true,
            supportsVideoGeneration: false, supportsRealtimeAudio: true,
            visionScore: 0, audioScore: 0.96,
        },
        performance: { avgLatencyMs: 300, reliabilityPercent: 99.0 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.3, [Intent.Creative]: 0.6, [Intent.Analysis]: 0.5, [Intent.Factual]: 0.6,
                [Intent.Conversation]: 0.95, [Intent.Task]: 0.65, [Intent.Brainstorm]: 0.55, [Intent.Translation]: 0.7,
                [Intent.Summarization]: 0.4, [Intent.Extraction]: 0.3,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.85, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.2, [Intent.Math]: 0.3, [Intent.Planning]: 0.35,
            },
            domains: {
                [Domain.Technology]: 0.55, [Domain.Business]: 0.6, [Domain.Health]: 0.55, [Domain.Legal]: 0.45,
                [Domain.Finance]: 0.5, [Domain.Education]: 0.7, [Domain.Science]: 0.5, [Domain.CreativeArts]: 0.65,
                [Domain.Lifestyle]: 0.75, [Domain.General]: 0.8, [Domain.Government]: 0.4, [Domain.Relationships]: 0.7,
                [Domain.Shopping]: 0.55, [Domain.EventPlanning]: 0.55, [Domain.Weather]: 0.45, [Domain.Sports]: 0.5,
            },
            complexity: { [Complexity.Quick]: 0.95, [Complexity.Standard]: 0.7, [Complexity.Demanding]: 0.4 },
        },
        humanFactors: {
            empathyScore: 0.88, playfulnessScore: 0.82, professionalismScore: 0.8, conciseness: 0.85,
            verbosity: 0.45, conversationalTone: 0.95, formalTone: 0.72,
            lateNightSuitability: 0.9, workHoursSuitability: 0.85,
        },
        specializations: ['realtime_audio', 'voice_generation', 'voice_agents'],
        accessTier: AccessTier.Premium, creditCost: 20, available: true,
    },
    // ---------------------------------------------------------------
    // Gemini 3.1 Pro Preview (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', provider: 'google',
        description: 'Latest Gemini flagship. Best reasoning and coding from Google. 1M context window.',
        pricing: { inputPer1k: 0.00125, outputPer1k: 0.01, cachedInputPer1k: 0.000315 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: true, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.95, audioScore: 0.88,
        },
        performance: { avgLatencyMs: 1800, reliabilityPercent: 99.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.96, [Intent.Creative]: 0.88, [Intent.Analysis]: 0.96, [Intent.Factual]: 0.92,
                [Intent.Conversation]: 0.88, [Intent.Task]: 0.94, [Intent.Brainstorm]: 0.88, [Intent.Translation]: 0.9,
                [Intent.Summarization]: 0.92, [Intent.Extraction]: 0.92,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.88, [Intent.Math]: 0.94, [Intent.Planning]: 0.9,
            },
            domains: {
                [Domain.Technology]: 0.96, [Domain.Business]: 0.88, [Domain.Health]: 0.88, [Domain.Legal]: 0.86,
                [Domain.Finance]: 0.88, [Domain.Education]: 0.9, [Domain.Science]: 0.94, [Domain.CreativeArts]: 0.84,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.9, [Domain.Government]: 0.84, [Domain.Relationships]: 0.78,
                [Domain.Shopping]: 0.76, [Domain.EventPlanning]: 0.78, [Domain.Weather]: 0.74, [Domain.Sports]: 0.76,
            },
            complexity: { [Complexity.Quick]: 0.82, [Complexity.Standard]: 0.94, [Complexity.Demanding]: 0.96 },
        },
        humanFactors: {
            empathyScore: 0.84, playfulnessScore: 0.78, professionalismScore: 0.94, conciseness: 0.78,
            verbosity: 0.82, conversationalTone: 0.86, formalTone: 0.92,
            lateNightSuitability: 0.82, workHoursSuitability: 0.96,
        },
        specializations: ['reasoning', 'coding', 'long_context', 'extended_thinking'],
        accessTier: AccessTier.Premium, creditCost: 20, available: true,
    },
    // ---------------------------------------------------------------
    // Gemini 3 Flash Preview (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'google',
        description: 'Fast next-gen Gemini model. Low latency with strong performance. 1M context.',
        pricing: { inputPer1k: 0.00015, outputPer1k: 0.0006, cachedInputPer1k: 3.75e-05 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: true, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.9, audioScore: 0.82,
        },
        performance: { avgLatencyMs: 600, reliabilityPercent: 99.4 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.88, [Intent.Creative]: 0.82, [Intent.Analysis]: 0.88, [Intent.Factual]: 0.86,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.88, [Intent.Brainstorm]: 0.82, [Intent.Translation]: 0.85,
                [Intent.Summarization]: 0.88, [Intent.Extraction]: 0.88,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.8, [Intent.Math]: 0.86, [Intent.Planning]: 0.84,
            },
            domains: {
                [Domain.Technology]: 0.9, [Domain.Business]: 0.84, [Domain.Health]: 0.82, [Domain.Legal]: 0.8,
                [Domain.Finance]: 0.84, [Domain.Education]: 0.86, [Domain.Science]: 0.88, [Domain.CreativeArts]: 0.8,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.86, [Domain.Government]: 0.78, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.74, [Domain.Weather]: 0.72, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.92, [Complexity.Standard]: 0.9, [Complexity.Demanding]: 0.86 },
        },
        humanFactors: {
            empathyScore: 0.82, playfulnessScore: 0.78, professionalismScore: 0.9, conciseness: 0.84,
            verbosity: 0.76, conversationalTone: 0.86, formalTone: 0.88,
            lateNightSuitability: 0.86, workHoursSuitability: 0.92,
        },
        specializations: ['fast_tasks', 'reasoning', 'long_context'],
        accessTier: AccessTier.Pro, creditCost: 5, available: true,
    },
    // ---------------------------------------------------------------
    // Gemini 2.5 Pro (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google',
        description: 'Flagship Gemini model with extended thinking. Excellent at reasoning, coding, and analysis. 1M context.',
        pricing: { inputPer1k: 0.00125, outputPer1k: 0.01, cachedInputPer1k: 0.000315 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: true, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.94, audioScore: 0.85,
        },
        performance: { avgLatencyMs: 1500, reliabilityPercent: 99.3 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.94, [Intent.Creative]: 0.86, [Intent.Analysis]: 0.94, [Intent.Factual]: 0.9,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.92, [Intent.Brainstorm]: 0.86, [Intent.Translation]: 0.88,
                [Intent.Summarization]: 0.9, [Intent.Extraction]: 0.9,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.86, [Intent.Math]: 0.92, [Intent.Planning]: 0.88,
            },
            domains: {
                [Domain.Technology]: 0.94, [Domain.Business]: 0.86, [Domain.Health]: 0.86, [Domain.Legal]: 0.84,
                [Domain.Finance]: 0.86, [Domain.Education]: 0.88, [Domain.Science]: 0.92, [Domain.CreativeArts]: 0.82,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.88, [Domain.Government]: 0.82, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.76, [Domain.Weather]: 0.72, [Domain.Sports]: 0.74,
            },
            complexity: { [Complexity.Quick]: 0.8, [Complexity.Standard]: 0.92, [Complexity.Demanding]: 0.95 },
        },
        humanFactors: {
            empathyScore: 0.84, playfulnessScore: 0.78, professionalismScore: 0.93, conciseness: 0.78,
            verbosity: 0.82, conversationalTone: 0.85, formalTone: 0.92,
            lateNightSuitability: 0.82, workHoursSuitability: 0.95,
        },
        specializations: ['reasoning', 'coding', 'long_context', 'extended_thinking'],
        accessTier: AccessTier.Pro, creditCost: 12,
        toolPricing: { searchGroundingPer1k: 35.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Gemini 2.5 Flash (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google',
        description: 'Fast workhorse with thinking and native image generation. 1M context. Great balance of speed and quality.',
        pricing: { inputPer1k: 7.5e-05, outputPer1k: 0.0003, cachedInputPer1k: 1.875e-05 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: true,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: true, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.9, audioScore: 0.8,
        },
        performance: { avgLatencyMs: 500, reliabilityPercent: 99.6 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.80, [Intent.Creative]: 0.76, [Intent.Analysis]: 0.80, [Intent.Factual]: 0.83,
                [Intent.Conversation]: 0.84, [Intent.Task]: 0.80, [Intent.Brainstorm]: 0.76, [Intent.Translation]: 0.86,
                [Intent.Summarization]: 0.85, [Intent.Extraction]: 0.84,
                [Intent.ImageGeneration]: 0.60, [Intent.VideoGeneration]: 0.08,
                [Intent.VoiceGeneration]: 0.07, [Intent.MusicGeneration]: 0.07,
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
            empathyScore: 0.80, playfulnessScore: 0.82, professionalismScore: 0.88, conciseness: 0.90,
            verbosity: 0.72, conversationalTone: 0.88, formalTone: 0.85,
            lateNightSuitability: 0.90, workHoursSuitability: 0.90,
        },
        specializations: ['fast_tasks', 'multilingual'],
        accessTier: AccessTier.Free, creditCost: 2,
        toolPricing: { searchGroundingPer1k: 35.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Gemini 2.5 Flash-Lite (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', provider: 'google',
        description: 'Ultra-fast, cost-efficient Gemini. 1M context. Best for high-volume, latency-sensitive tasks.',
        pricing: { inputPer1k: 2.5e-05, outputPer1k: 0.00015, cachedInputPer1k: 6.25e-06 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.82, audioScore: 0.7,
        },
        performance: { avgLatencyMs: 300, reliabilityPercent: 99.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.70, [Intent.Creative]: 0.68, [Intent.Analysis]: 0.70, [Intent.Factual]: 0.74,
                [Intent.Conversation]: 0.78, [Intent.Task]: 0.72, [Intent.Brainstorm]: 0.65, [Intent.Translation]: 0.80,
                [Intent.Summarization]: 0.76, [Intent.Extraction]: 0.78,
                [Intent.ImageGeneration]: 0.07, [Intent.VideoGeneration]: 0.06,
                [Intent.VoiceGeneration]: 0.05, [Intent.MusicGeneration]: 0.05,
                [Intent.Research]: 0.62, [Intent.Math]: 0.64, [Intent.Planning]: 0.62,
            },
            domains: {
                [Domain.Technology]: 0.71, [Domain.Business]: 0.69, [Domain.Health]: 0.67, [Domain.Legal]: 0.65,
                [Domain.Finance]: 0.68, [Domain.Education]: 0.74, [Domain.Science]: 0.70, [Domain.CreativeArts]: 0.68,
                [Domain.Lifestyle]: 0.74, [Domain.General]: 0.78, [Domain.Government]: 0.62, [Domain.Relationships]: 0.68,
                [Domain.Shopping]: 0.68, [Domain.EventPlanning]: 0.63, [Domain.Weather]: 0.64, [Domain.Sports]: 0.66,
            },
            complexity: { [Complexity.Quick]: 0.96, [Complexity.Standard]: 0.80, [Complexity.Demanding]: 0.58 },
        },
        humanFactors: {
            empathyScore: 0.75, playfulnessScore: 0.78, professionalismScore: 0.82, conciseness: 0.95,
            verbosity: 0.55, conversationalTone: 0.85, formalTone: 0.80,
            lateNightSuitability: 0.92, workHoursSuitability: 0.85,
        },
        specializations: ['fast_tasks', 'budget'],
        accessTier: AccessTier.Free, creditCost: 1, available: true,
    },
    // ---------------------------------------------------------------
    // Nano Banana 2 (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-3.1-flash-image-preview', name: 'Nano Banana 2', provider: 'google',
        description: 'Next-gen Google image generation from Gemini 3.1. High quality, fast rendering.',
        pricing: { inputPer1k: 0.00015, outputPer1k: 0.0006 },
        capabilities: {
            maxInputTokens: 32000, maxOutputTokens: 8192,
            supportsStreaming: false, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 4000, reliabilityPercent: 99.3 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.08, [Intent.Creative]: 0.92, [Intent.Analysis]: 0.15, [Intent.Factual]: 0.1,
                [Intent.Conversation]: 0.1, [Intent.Task]: 0.4, [Intent.Brainstorm]: 0.5, [Intent.Translation]: 0.05,
                [Intent.Summarization]: 0.05, [Intent.Extraction]: 0.08,
                [Intent.ImageGeneration]: 0.94, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.04, [Intent.Math]: 0.04, [Intent.Planning]: 0.08,
            },
            domains: {
                [Domain.Technology]: 0.58, [Domain.Business]: 0.68, [Domain.Health]: 0.52, [Domain.Legal]: 0.28,
                [Domain.Finance]: 0.42, [Domain.Education]: 0.62, [Domain.Science]: 0.58, [Domain.CreativeArts]: 0.96,
                [Domain.Lifestyle]: 0.84, [Domain.General]: 0.78, [Domain.Government]: 0.32, [Domain.Relationships]: 0.48,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.68, [Domain.Weather]: 0.38, [Domain.Sports]: 0.52,
            },
            complexity: { [Complexity.Quick]: 0.88, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.72 },
        },
        humanFactors: {
            empathyScore: 0.48, playfulnessScore: 0.84, professionalismScore: 0.86, conciseness: 0.95,
            verbosity: 0.2, conversationalTone: 0.42, formalTone: 0.7,
            lateNightSuitability: 0.85, workHoursSuitability: 0.88,
        },
        specializations: ['image_generation'],
        accessTier: AccessTier.Pro, creditCost: 4, available: true,
    },
    // ---------------------------------------------------------------
    // Nano Banana (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-2.5-flash-image', name: 'Nano Banana', provider: 'google',
        description: 'Free image generation from Gemini 2.5 Flash. Good quality, budget-friendly.',
        pricing: { inputPer1k: 7.5e-05, outputPer1k: 0.0003 },
        capabilities: {
            maxInputTokens: 32000, maxOutputTokens: 8192,
            supportsStreaming: false, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.85, audioScore: 0,
        },
        performance: { avgLatencyMs: 5000, reliabilityPercent: 99.4 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.06, [Intent.Creative]: 0.88, [Intent.Analysis]: 0.12, [Intent.Factual]: 0.08,
                [Intent.Conversation]: 0.08, [Intent.Task]: 0.35, [Intent.Brainstorm]: 0.45, [Intent.Translation]: 0.04,
                [Intent.Summarization]: 0.04, [Intent.Extraction]: 0.06,
                [Intent.ImageGeneration]: 0.90, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.03, [Intent.Math]: 0.03, [Intent.Planning]: 0.06,
            },
            domains: {
                [Domain.Technology]: 0.54, [Domain.Business]: 0.64, [Domain.Health]: 0.48, [Domain.Legal]: 0.24,
                [Domain.Finance]: 0.38, [Domain.Education]: 0.58, [Domain.Science]: 0.54, [Domain.CreativeArts]: 0.92,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.74, [Domain.Government]: 0.28, [Domain.Relationships]: 0.44,
                [Domain.Shopping]: 0.68, [Domain.EventPlanning]: 0.64, [Domain.Weather]: 0.34, [Domain.Sports]: 0.48,
            },
            complexity: { [Complexity.Quick]: 0.9, [Complexity.Standard]: 0.84, [Complexity.Demanding]: 0.64 },
        },
        humanFactors: {
            empathyScore: 0.46, playfulnessScore: 0.82, professionalismScore: 0.82, conciseness: 0.95,
            verbosity: 0.18, conversationalTone: 0.4, formalTone: 0.68,
            lateNightSuitability: 0.88, workHoursSuitability: 0.86,
        },
        specializations: ['image_generation', 'budget'],
        accessTier: AccessTier.Free, creditCost: 2, available: true,
    },
    // ---------------------------------------------------------------
    // Imagen 4 Fast (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4 Fast', provider: 'google',
        description: 'Fast image generation from Google Imagen 4. Optimized for speed.',
        pricing: { inputPer1k: 0.001, outputPer1k: 0.004 },
        capabilities: {
            maxInputTokens: 4096, maxOutputTokens: 1024,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 3000, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.9, [Intent.Analysis]: 0.05, [Intent.Factual]: 0.05,
                [Intent.Conversation]: 0.0, [Intent.Task]: 0.3, [Intent.Brainstorm]: 0.4, [Intent.Translation]: 0.0,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.93, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.05,
            },
            domains: {
                [Domain.Technology]: 0.5, [Domain.Business]: 0.6, [Domain.Health]: 0.45, [Domain.Legal]: 0.2,
                [Domain.Finance]: 0.35, [Domain.Education]: 0.55, [Domain.Science]: 0.5, [Domain.CreativeArts]: 0.94,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.72, [Domain.Government]: 0.25, [Domain.Relationships]: 0.4,
                [Domain.Shopping]: 0.68, [Domain.EventPlanning]: 0.62, [Domain.Weather]: 0.3, [Domain.Sports]: 0.48,
            },
            complexity: { [Complexity.Quick]: 0.92, [Complexity.Standard]: 0.85, [Complexity.Demanding]: 0.6 },
        },
        humanFactors: {
            empathyScore: 0.4, playfulnessScore: 0.8, professionalismScore: 0.85, conciseness: 0.98,
            verbosity: 0.1, conversationalTone: 0.3, formalTone: 0.7,
            lateNightSuitability: 0.88, workHoursSuitability: 0.88,
        },
        specializations: ['image_generation', 'fast_tasks'],
        accessTier: AccessTier.Free, creditCost: 2, available: true,
    },
    // ---------------------------------------------------------------
    // Imagen 4 Standard (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'imagen-4.0-generate-001', name: 'Imagen 4 Standard', provider: 'google',
        description: 'Premium image generation from Google Imagen 4. Highest quality, photorealistic output.',
        pricing: { inputPer1k: 0.002, outputPer1k: 0.008 },
        capabilities: {
            maxInputTokens: 4096, maxOutputTokens: 1024,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: true,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 6000, reliabilityPercent: 99.3 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.94, [Intent.Analysis]: 0.05, [Intent.Factual]: 0.05,
                [Intent.Conversation]: 0.0, [Intent.Task]: 0.35, [Intent.Brainstorm]: 0.45, [Intent.Translation]: 0.0,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.96, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.05,
            },
            domains: {
                [Domain.Technology]: 0.55, [Domain.Business]: 0.65, [Domain.Health]: 0.5, [Domain.Legal]: 0.25,
                [Domain.Finance]: 0.4, [Domain.Education]: 0.6, [Domain.Science]: 0.55, [Domain.CreativeArts]: 0.97,
                [Domain.Lifestyle]: 0.85, [Domain.General]: 0.78, [Domain.Government]: 0.3, [Domain.Relationships]: 0.45,
                [Domain.Shopping]: 0.72, [Domain.EventPlanning]: 0.68, [Domain.Weather]: 0.35, [Domain.Sports]: 0.52,
            },
            complexity: { [Complexity.Quick]: 0.88, [Complexity.Standard]: 0.9, [Complexity.Demanding]: 0.7 },
        },
        humanFactors: {
            empathyScore: 0.42, playfulnessScore: 0.82, professionalismScore: 0.9, conciseness: 0.98,
            verbosity: 0.1, conversationalTone: 0.3, formalTone: 0.72,
            lateNightSuitability: 0.85, workHoursSuitability: 0.9,
        },
        specializations: ['image_generation'],
        accessTier: AccessTier.Pro, creditCost: 6, available: true,
    },
    // ---------------------------------------------------------------
    // Veo 3.1 (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'veo-3.1-generate-preview', name: 'Veo 3.1', provider: 'google',
        description: 'Google video generation model. Text-to-video with high fidelity and cinematic quality.',
        pricing: { inputPer1k: 0.012, outputPer1k: 0.05 },
        capabilities: {
            maxInputTokens: 16000, maxOutputTokens: 4096,
            supportsStreaming: false, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: true, supportsRealtimeAudio: false,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 45000, reliabilityPercent: 97.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.9, [Intent.Analysis]: 0.08, [Intent.Factual]: 0.05,
                [Intent.Conversation]: 0.05, [Intent.Task]: 0.28, [Intent.Brainstorm]: 0.38, [Intent.Translation]: 0.0,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.25, [Intent.VideoGeneration]: 0.96,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.08,
            },
            domains: {
                [Domain.Technology]: 0.48, [Domain.Business]: 0.62, [Domain.Health]: 0.38, [Domain.Legal]: 0.18,
                [Domain.Finance]: 0.32, [Domain.Education]: 0.58, [Domain.Science]: 0.48, [Domain.CreativeArts]: 0.96,
                [Domain.Lifestyle]: 0.78, [Domain.General]: 0.68, [Domain.Government]: 0.22, [Domain.Relationships]: 0.42,
                [Domain.Shopping]: 0.62, [Domain.EventPlanning]: 0.58, [Domain.Weather]: 0.28, [Domain.Sports]: 0.52,
            },
            complexity: { [Complexity.Quick]: 0.58, [Complexity.Standard]: 0.78, [Complexity.Demanding]: 0.82 },
        },
        humanFactors: {
            empathyScore: 0.38, playfulnessScore: 0.78, professionalismScore: 0.84, conciseness: 0.95,
            verbosity: 0.1, conversationalTone: 0.28, formalTone: 0.64,
            lateNightSuitability: 0.78, workHoursSuitability: 0.84,
        },
        specializations: ['video_generation'],
        accessTier: AccessTier.Premium, creditCost: 80, available: true,
    },
    // ---------------------------------------------------------------
    // Gemini 2.5 Flash TTS (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS', provider: 'google',
        description: 'Text-to-speech from Gemini Flash. Natural-sounding voice synthesis with multiple voices.',
        pricing: { inputPer1k: 0.00015, outputPer1k: 0.0006 },
        capabilities: {
            maxInputTokens: 16000, maxOutputTokens: 8000,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: true, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.9,
        },
        performance: { avgLatencyMs: 500, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.55, [Intent.Analysis]: 0.0, [Intent.Factual]: 0.0,
                [Intent.Conversation]: 0.28, [Intent.Task]: 0.45, [Intent.Brainstorm]: 0.08, [Intent.Translation]: 0.28,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.94, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.28, [Domain.Business]: 0.48, [Domain.Health]: 0.38, [Domain.Legal]: 0.28,
                [Domain.Finance]: 0.32, [Domain.Education]: 0.62, [Domain.Science]: 0.32, [Domain.CreativeArts]: 0.72,
                [Domain.Lifestyle]: 0.58, [Domain.General]: 0.58, [Domain.Government]: 0.28, [Domain.Relationships]: 0.42,
                [Domain.Shopping]: 0.38, [Domain.EventPlanning]: 0.42, [Domain.Weather]: 0.28, [Domain.Sports]: 0.32,
            },
            complexity: { [Complexity.Quick]: 0.9, [Complexity.Standard]: 0.72, [Complexity.Demanding]: 0.38 },
        },
        humanFactors: {
            empathyScore: 0.68, playfulnessScore: 0.62, professionalismScore: 0.82, conciseness: 0.9,
            verbosity: 0.28, conversationalTone: 0.72, formalTone: 0.78,
            lateNightSuitability: 0.84, workHoursSuitability: 0.88,
        },
        specializations: ['tts', 'voice_generation'],
        accessTier: AccessTier.Pro, creditCost: 2, available: true,
    },
    // ---------------------------------------------------------------
    // Gemini 2.5 Flash Live (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'gemini-2.5-flash-native-audio-preview-12-2025', name: 'Gemini 2.5 Flash Live', provider: 'google',
        description: 'Realtime audio model from Google. Low-latency voice conversations with native audio.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.012 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 16384,
            supportsStreaming: true, supportsVision: true, supportsAudio: true,
            supportsFunctionCalling: true, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: true, supportsSTT: true,
            supportsVideoGeneration: false, supportsRealtimeAudio: true,
            visionScore: 0.82, audioScore: 0.94,
        },
        performance: { avgLatencyMs: 350, reliabilityPercent: 99.0 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.25, [Intent.Creative]: 0.55, [Intent.Analysis]: 0.45, [Intent.Factual]: 0.55,
                [Intent.Conversation]: 0.92, [Intent.Task]: 0.6, [Intent.Brainstorm]: 0.5, [Intent.Translation]: 0.65,
                [Intent.Summarization]: 0.35, [Intent.Extraction]: 0.28,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.82, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.18, [Intent.Math]: 0.25, [Intent.Planning]: 0.3,
            },
            domains: {
                [Domain.Technology]: 0.5, [Domain.Business]: 0.55, [Domain.Health]: 0.5, [Domain.Legal]: 0.42,
                [Domain.Finance]: 0.48, [Domain.Education]: 0.68, [Domain.Science]: 0.48, [Domain.CreativeArts]: 0.62,
                [Domain.Lifestyle]: 0.72, [Domain.General]: 0.78, [Domain.Government]: 0.38, [Domain.Relationships]: 0.68,
                [Domain.Shopping]: 0.52, [Domain.EventPlanning]: 0.52, [Domain.Weather]: 0.42, [Domain.Sports]: 0.48,
            },
            complexity: { [Complexity.Quick]: 0.94, [Complexity.Standard]: 0.68, [Complexity.Demanding]: 0.38 },
        },
        humanFactors: {
            empathyScore: 0.86, playfulnessScore: 0.8, professionalismScore: 0.78, conciseness: 0.84,
            verbosity: 0.42, conversationalTone: 0.94, formalTone: 0.7,
            lateNightSuitability: 0.88, workHoursSuitability: 0.84,
        },
        specializations: ['realtime_audio', 'voice_generation', 'voice_agents'],
        accessTier: AccessTier.Premium, creditCost: 15, available: true,
    },
    // ---------------------------------------------------------------
    // Gemini Deep Research (GOOGLE)
    // ---------------------------------------------------------------
    {
        id: 'deep-research-pro-preview-12-2025', name: 'Gemini Deep Research', provider: 'google',
        description: 'Google deep research agent. Multi-step web research with comprehensive synthesis.',
        pricing: { inputPer1k: 0.00125, outputPer1k: 0.01 },
        capabilities: {
            maxInputTokens: 1000000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.9, audioScore: 0,
        },
        performance: { avgLatencyMs: 25000, reliabilityPercent: 98.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.7, [Intent.Creative]: 0.7, [Intent.Analysis]: 0.95, [Intent.Factual]: 0.96,
                [Intent.Conversation]: 0.65, [Intent.Task]: 0.82, [Intent.Brainstorm]: 0.8, [Intent.Translation]: 0.72,
                [Intent.Summarization]: 0.92, [Intent.Extraction]: 0.88,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.98, [Intent.Math]: 0.85, [Intent.Planning]: 0.88,
            },
            domains: {
                [Domain.Technology]: 0.9, [Domain.Business]: 0.88, [Domain.Health]: 0.9, [Domain.Legal]: 0.88,
                [Domain.Finance]: 0.9, [Domain.Education]: 0.88, [Domain.Science]: 0.94, [Domain.CreativeArts]: 0.7,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.86, [Domain.Government]: 0.86, [Domain.Relationships]: 0.68,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.7, [Domain.Weather]: 0.68, [Domain.Sports]: 0.72,
            },
            complexity: { [Complexity.Quick]: 0.48, [Complexity.Standard]: 0.78, [Complexity.Demanding]: 0.97 },
        },
        humanFactors: {
            empathyScore: 0.7, playfulnessScore: 0.58, professionalismScore: 0.95, conciseness: 0.55,
            verbosity: 0.94, conversationalTone: 0.66, formalTone: 0.94,
            lateNightSuitability: 0.64, workHoursSuitability: 0.95,
        },
        specializations: ['deep_research', 'research', 'comprehensive_reports'],
        accessTier: AccessTier.Premium, creditCost: 40, available: true,
    },
    // ---------------------------------------------------------------
    // Grok 4 (XAI)
    // ---------------------------------------------------------------
    {
        id: 'grok-4', name: 'Grok 4', provider: 'xai',
        description: 'xAI flagship reasoning model. Strong at web search, reasoning, and real-time data. 256K context.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.015 },
        capabilities: {
            maxInputTokens: 256000, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: true, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.88, audioScore: 0,
        },
        performance: { avgLatencyMs: 2000, reliabilityPercent: 99.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.88, [Intent.Creative]: 0.84, [Intent.Analysis]: 0.92, [Intent.Factual]: 0.94,
                [Intent.Conversation]: 0.88, [Intent.Task]: 0.88, [Intent.Brainstorm]: 0.85, [Intent.Translation]: 0.82,
                [Intent.Summarization]: 0.88, [Intent.Extraction]: 0.86,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.92, [Intent.Math]: 0.9, [Intent.Planning]: 0.86,
            },
            domains: {
                [Domain.Technology]: 0.92, [Domain.Business]: 0.86, [Domain.Health]: 0.82, [Domain.Legal]: 0.8,
                [Domain.Finance]: 0.88, [Domain.Education]: 0.86, [Domain.Science]: 0.9, [Domain.CreativeArts]: 0.8,
                [Domain.Lifestyle]: 0.82, [Domain.General]: 0.88, [Domain.Government]: 0.82, [Domain.Relationships]: 0.78,
                [Domain.Shopping]: 0.76, [Domain.EventPlanning]: 0.74, [Domain.Weather]: 0.78, [Domain.Sports]: 0.85,
            },
            complexity: { [Complexity.Quick]: 0.82, [Complexity.Standard]: 0.9, [Complexity.Demanding]: 0.94 },
        },
        humanFactors: {
            empathyScore: 0.82, playfulnessScore: 0.85, professionalismScore: 0.88, conciseness: 0.78,
            verbosity: 0.82, conversationalTone: 0.88, formalTone: 0.86,
            lateNightSuitability: 0.85, workHoursSuitability: 0.92,
        },
        specializations: ['web_search', 'reasoning', 'realtime_data', 'x_search'],
        accessTier: AccessTier.Pro, creditCost: 10,
        toolPricing: { webSearchPer1k: 5.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Grok 4.1 Fast (XAI)
    // ---------------------------------------------------------------
    {
        id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xai',
        description: 'Latest fast Grok model. 2M context window. Great for large document processing.',
        pricing: { inputPer1k: 0.0005, outputPer1k: 0.002, cachedInputPer1k: 0.000125 },
        capabilities: {
            maxInputTokens: 2000000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.85, audioScore: 0,
        },
        performance: { avgLatencyMs: 600, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.82, [Intent.Creative]: 0.78, [Intent.Analysis]: 0.83, [Intent.Factual]: 0.87,
                [Intent.Conversation]: 0.86, [Intent.Task]: 0.8, [Intent.Brainstorm]: 0.78, [Intent.Translation]: 0.76,
                [Intent.Summarization]: 0.83, [Intent.Extraction]: 0.82,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.86, [Intent.Math]: 0.8, [Intent.Planning]: 0.76,
            },
            domains: {
                [Domain.Technology]: 0.83, [Domain.Business]: 0.8, [Domain.Health]: 0.78, [Domain.Legal]: 0.76,
                [Domain.Finance]: 0.8, [Domain.Education]: 0.8, [Domain.Science]: 0.82, [Domain.CreativeArts]: 0.76,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.84, [Domain.Government]: 0.76, [Domain.Relationships]: 0.76,
                [Domain.Shopping]: 0.75, [Domain.EventPlanning]: 0.74, [Domain.Weather]: 0.78, [Domain.Sports]: 0.8,
            },
            complexity: { [Complexity.Quick]: 0.94, [Complexity.Standard]: 0.86, [Complexity.Demanding]: 0.74 },
        },
        humanFactors: {
            empathyScore: 0.78, playfulnessScore: 0.82, professionalismScore: 0.83, conciseness: 0.88,
            verbosity: 0.68, conversationalTone: 0.86, formalTone: 0.8,
            lateNightSuitability: 0.9, workHoursSuitability: 0.86,
        },
        specializations: ['fast_tasks', 'long_context', 'web_search', 'x_search'],
        accessTier: AccessTier.Free, creditCost: 2,
        toolPricing: { webSearchPer1k: 5.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Grok 4 Fast (XAI)
    // ---------------------------------------------------------------
    {
        id: 'grok-4-fast', name: 'Grok 4 Fast', provider: 'xai',
        description: 'Fast Grok 4 model. 2M context. Efficient for everyday tasks with web access.',
        pricing: { inputPer1k: 0.0005, outputPer1k: 0.002, cachedInputPer1k: 0.000125 },
        capabilities: {
            maxInputTokens: 2000000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: true, supportsAudio: false,
            supportsFunctionCalling: true, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0.84, audioScore: 0,
        },
        performance: { avgLatencyMs: 700, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.8, [Intent.Creative]: 0.76, [Intent.Analysis]: 0.82, [Intent.Factual]: 0.86,
                [Intent.Conversation]: 0.85, [Intent.Task]: 0.79, [Intent.Brainstorm]: 0.77, [Intent.Translation]: 0.75,
                [Intent.Summarization]: 0.82, [Intent.Extraction]: 0.81,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.85, [Intent.Math]: 0.78, [Intent.Planning]: 0.75,
            },
            domains: {
                [Domain.Technology]: 0.82, [Domain.Business]: 0.79, [Domain.Health]: 0.77, [Domain.Legal]: 0.75,
                [Domain.Finance]: 0.79, [Domain.Education]: 0.79, [Domain.Science]: 0.81, [Domain.CreativeArts]: 0.75,
                [Domain.Lifestyle]: 0.79, [Domain.General]: 0.83, [Domain.Government]: 0.75, [Domain.Relationships]: 0.75,
                [Domain.Shopping]: 0.74, [Domain.EventPlanning]: 0.73, [Domain.Weather]: 0.77, [Domain.Sports]: 0.79,
            },
            complexity: { [Complexity.Quick]: 0.93, [Complexity.Standard]: 0.85, [Complexity.Demanding]: 0.73 },
        },
        humanFactors: {
            empathyScore: 0.76, playfulnessScore: 0.8, professionalismScore: 0.84, conciseness: 0.86,
            verbosity: 0.7, conversationalTone: 0.85, formalTone: 0.82,
            lateNightSuitability: 0.88, workHoursSuitability: 0.88,
        },
        specializations: ['fast_tasks', 'long_context', 'web_search', 'x_search'],
        accessTier: AccessTier.Free, creditCost: 2,
        toolPricing: { webSearchPer1k: 5.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Perplexity Sonar (PERPLEXITY)
    // ---------------------------------------------------------------
    {
        id: 'sonar', name: 'Perplexity Sonar', provider: 'perplexity',
        description: 'Real-time web search AI. Answers with citations from live web data.',
        pricing: { inputPer1k: 0.001, outputPer1k: 0.001 },
        capabilities: {
            maxInputTokens: 128000, maxOutputTokens: 16384,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 1200, reliabilityPercent: 99.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.6, [Intent.Creative]: 0.55, [Intent.Analysis]: 0.78, [Intent.Factual]: 0.92,
                [Intent.Conversation]: 0.7, [Intent.Task]: 0.72, [Intent.Brainstorm]: 0.65, [Intent.Translation]: 0.6,
                [Intent.Summarization]: 0.8, [Intent.Extraction]: 0.78,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.88, [Intent.Math]: 0.6, [Intent.Planning]: 0.65,
            },
            domains: {
                [Domain.Technology]: 0.85, [Domain.Business]: 0.82, [Domain.Health]: 0.8, [Domain.Legal]: 0.76,
                [Domain.Finance]: 0.84, [Domain.Education]: 0.8, [Domain.Science]: 0.82, [Domain.CreativeArts]: 0.6,
                [Domain.Lifestyle]: 0.78, [Domain.General]: 0.85, [Domain.Government]: 0.78, [Domain.Relationships]: 0.62,
                [Domain.Shopping]: 0.82, [Domain.EventPlanning]: 0.72, [Domain.Weather]: 0.85, [Domain.Sports]: 0.84,
            },
            complexity: { [Complexity.Quick]: 0.9, [Complexity.Standard]: 0.8, [Complexity.Demanding]: 0.62 },
        },
        humanFactors: {
            empathyScore: 0.68, playfulnessScore: 0.6, professionalismScore: 0.88, conciseness: 0.85,
            verbosity: 0.65, conversationalTone: 0.72, formalTone: 0.86,
            lateNightSuitability: 0.85, workHoursSuitability: 0.9,
        },
        specializations: ['web_search', 'research', 'fact_checking', 'citations'],
        accessTier: AccessTier.Free, creditCost: 2,
        toolPricing: { requestFeePer1k: 5.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Perplexity Sonar Pro (PERPLEXITY)
    // ---------------------------------------------------------------
    {
        id: 'sonar-pro', name: 'Perplexity Sonar Pro', provider: 'perplexity',
        description: 'Advanced search AI with multi-step web research. Deeper analysis and more comprehensive results.',
        pricing: { inputPer1k: 0.003, outputPer1k: 0.015 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 3000, reliabilityPercent: 99.0 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.65, [Intent.Creative]: 0.6, [Intent.Analysis]: 0.85, [Intent.Factual]: 0.95,
                [Intent.Conversation]: 0.72, [Intent.Task]: 0.78, [Intent.Brainstorm]: 0.72, [Intent.Translation]: 0.62,
                [Intent.Summarization]: 0.85, [Intent.Extraction]: 0.82,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.94, [Intent.Math]: 0.65, [Intent.Planning]: 0.72,
            },
            domains: {
                [Domain.Technology]: 0.88, [Domain.Business]: 0.86, [Domain.Health]: 0.85, [Domain.Legal]: 0.82,
                [Domain.Finance]: 0.88, [Domain.Education]: 0.84, [Domain.Science]: 0.88, [Domain.CreativeArts]: 0.64,
                [Domain.Lifestyle]: 0.8, [Domain.General]: 0.88, [Domain.Government]: 0.82, [Domain.Relationships]: 0.64,
                [Domain.Shopping]: 0.84, [Domain.EventPlanning]: 0.76, [Domain.Weather]: 0.86, [Domain.Sports]: 0.86,
            },
            complexity: { [Complexity.Quick]: 0.82, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.78 },
        },
        humanFactors: {
            empathyScore: 0.7, playfulnessScore: 0.58, professionalismScore: 0.92, conciseness: 0.78,
            verbosity: 0.76, conversationalTone: 0.7, formalTone: 0.9,
            lateNightSuitability: 0.82, workHoursSuitability: 0.92,
        },
        specializations: ['research', 'web_search', 'multi_step_search', 'citations'],
        accessTier: AccessTier.Pro, creditCost: 8,
        toolPricing: { requestFeePer1k: 5.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Perplexity Sonar Reasoning Pro (PERPLEXITY)
    // ---------------------------------------------------------------
    {
        id: 'sonar-reasoning-pro', name: 'Perplexity Sonar Reasoning Pro', provider: 'perplexity',
        description: 'Reasoning-enhanced search. Combines chain-of-thought with real-time web search for complex questions.',
        pricing: { inputPer1k: 0.002, outputPer1k: 0.008 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 32768,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 5000, reliabilityPercent: 98.8 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.7, [Intent.Creative]: 0.62, [Intent.Analysis]: 0.9, [Intent.Factual]: 0.95,
                [Intent.Conversation]: 0.7, [Intent.Task]: 0.8, [Intent.Brainstorm]: 0.75, [Intent.Translation]: 0.6,
                [Intent.Summarization]: 0.86, [Intent.Extraction]: 0.84,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.96, [Intent.Math]: 0.78, [Intent.Planning]: 0.78,
            },
            domains: {
                [Domain.Technology]: 0.9, [Domain.Business]: 0.87, [Domain.Health]: 0.86, [Domain.Legal]: 0.84,
                [Domain.Finance]: 0.9, [Domain.Education]: 0.86, [Domain.Science]: 0.92, [Domain.CreativeArts]: 0.62,
                [Domain.Lifestyle]: 0.78, [Domain.General]: 0.88, [Domain.Government]: 0.84, [Domain.Relationships]: 0.62,
                [Domain.Shopping]: 0.82, [Domain.EventPlanning]: 0.74, [Domain.Weather]: 0.84, [Domain.Sports]: 0.84,
            },
            complexity: { [Complexity.Quick]: 0.72, [Complexity.Standard]: 0.88, [Complexity.Demanding]: 0.9 },
        },
        humanFactors: {
            empathyScore: 0.68, playfulnessScore: 0.55, professionalismScore: 0.94, conciseness: 0.72,
            verbosity: 0.82, conversationalTone: 0.68, formalTone: 0.92,
            lateNightSuitability: 0.78, workHoursSuitability: 0.94,
        },
        specializations: ['reasoning', 'research', 'web_search', 'citations'],
        accessTier: AccessTier.Premium, creditCost: 15,
        toolPricing: { requestFeePer1k: 5.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // Perplexity Sonar Deep Research (PERPLEXITY)
    // ---------------------------------------------------------------
    {
        id: 'sonar-deep-research', name: 'Perplexity Sonar Deep Research', provider: 'perplexity',
        description: 'Deep research agent. Autonomous multi-step web research with comprehensive analysis and citations.',
        pricing: { inputPer1k: 0.002, outputPer1k: 0.008 },
        capabilities: {
            maxInputTokens: 200000, maxOutputTokens: 65536,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: true, supportsWebSearch: true,
            supportsReasoning: true, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0,
        },
        performance: { avgLatencyMs: 20000, reliabilityPercent: 98.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.62, [Intent.Creative]: 0.6, [Intent.Analysis]: 0.94, [Intent.Factual]: 0.97,
                [Intent.Conversation]: 0.6, [Intent.Task]: 0.78, [Intent.Brainstorm]: 0.76, [Intent.Translation]: 0.58,
                [Intent.Summarization]: 0.9, [Intent.Extraction]: 0.88,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.98, [Intent.Math]: 0.72, [Intent.Planning]: 0.82,
            },
            domains: {
                [Domain.Technology]: 0.92, [Domain.Business]: 0.9, [Domain.Health]: 0.9, [Domain.Legal]: 0.88,
                [Domain.Finance]: 0.92, [Domain.Education]: 0.88, [Domain.Science]: 0.94, [Domain.CreativeArts]: 0.62,
                [Domain.Lifestyle]: 0.76, [Domain.General]: 0.88, [Domain.Government]: 0.86, [Domain.Relationships]: 0.6,
                [Domain.Shopping]: 0.82, [Domain.EventPlanning]: 0.72, [Domain.Weather]: 0.82, [Domain.Sports]: 0.84,
            },
            complexity: { [Complexity.Quick]: 0.5, [Complexity.Standard]: 0.8, [Complexity.Demanding]: 0.96 },
        },
        humanFactors: {
            empathyScore: 0.66, playfulnessScore: 0.52, professionalismScore: 0.95, conciseness: 0.58,
            verbosity: 0.92, conversationalTone: 0.64, formalTone: 0.94,
            lateNightSuitability: 0.7, workHoursSuitability: 0.94,
        },
        specializations: ['deep_research', 'research', 'comprehensive_reports', 'citations'],
        accessTier: AccessTier.Premium, creditCost: 30,
        toolPricing: { requestFeePer1k: 5.0 }, available: true,
    },
    // ---------------------------------------------------------------
    // ElevenLabs TTS Flash (ELEVENLABS)
    // ---------------------------------------------------------------
    {
        id: 'eleven_flash_v2_5', name: 'ElevenLabs TTS Flash', provider: 'elevenlabs',
        description: 'Low-latency text-to-speech. Natural voices with fast generation. Ideal for real-time applications.',
        pricing: { inputPer1k: 0.0008, outputPer1k: 0.0 },
        capabilities: {
            maxInputTokens: 40000, maxOutputTokens: 0,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: true, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.96,
        },
        performance: { avgLatencyMs: 200, reliabilityPercent: 99.6 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.65, [Intent.Analysis]: 0.0, [Intent.Factual]: 0.0,
                [Intent.Conversation]: 0.3, [Intent.Task]: 0.5, [Intent.Brainstorm]: 0.05, [Intent.Translation]: 0.25,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.98, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.3, [Domain.Business]: 0.55, [Domain.Health]: 0.45, [Domain.Legal]: 0.35,
                [Domain.Finance]: 0.38, [Domain.Education]: 0.7, [Domain.Science]: 0.35, [Domain.CreativeArts]: 0.82,
                [Domain.Lifestyle]: 0.65, [Domain.General]: 0.65, [Domain.Government]: 0.35, [Domain.Relationships]: 0.5,
                [Domain.Shopping]: 0.42, [Domain.EventPlanning]: 0.48, [Domain.Weather]: 0.32, [Domain.Sports]: 0.38,
            },
            complexity: { [Complexity.Quick]: 0.95, [Complexity.Standard]: 0.7, [Complexity.Demanding]: 0.3 },
        },
        humanFactors: {
            empathyScore: 0.75, playfulnessScore: 0.7, professionalismScore: 0.88, conciseness: 0.95,
            verbosity: 0.2, conversationalTone: 0.8, formalTone: 0.82,
            lateNightSuitability: 0.88, workHoursSuitability: 0.9,
        },
        specializations: ['tts', 'voice_generation', 'voice_cloning', 'fast_tasks'],
        accessTier: AccessTier.Pro, creditCost: 2, available: true,
    },
    // ---------------------------------------------------------------
    // ElevenLabs TTS Multilingual (ELEVENLABS)
    // ---------------------------------------------------------------
    {
        id: 'eleven_multilingual_v2', name: 'ElevenLabs TTS Multilingual', provider: 'elevenlabs',
        description: 'Premium multilingual text-to-speech. 29 languages with voice cloning. Highest quality voice synthesis.',
        pricing: { inputPer1k: 0.0016, outputPer1k: 0.0 },
        capabilities: {
            maxInputTokens: 40000, maxOutputTokens: 0,
            supportsStreaming: true, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: true, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.98,
        },
        performance: { avgLatencyMs: 400, reliabilityPercent: 99.4 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.7, [Intent.Analysis]: 0.0, [Intent.Factual]: 0.0,
                [Intent.Conversation]: 0.35, [Intent.Task]: 0.55, [Intent.Brainstorm]: 0.05, [Intent.Translation]: 0.4,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.99, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.32, [Domain.Business]: 0.58, [Domain.Health]: 0.48, [Domain.Legal]: 0.38,
                [Domain.Finance]: 0.4, [Domain.Education]: 0.75, [Domain.Science]: 0.38, [Domain.CreativeArts]: 0.88,
                [Domain.Lifestyle]: 0.68, [Domain.General]: 0.68, [Domain.Government]: 0.38, [Domain.Relationships]: 0.52,
                [Domain.Shopping]: 0.45, [Domain.EventPlanning]: 0.5, [Domain.Weather]: 0.34, [Domain.Sports]: 0.4,
            },
            complexity: { [Complexity.Quick]: 0.92, [Complexity.Standard]: 0.72, [Complexity.Demanding]: 0.35 },
        },
        humanFactors: {
            empathyScore: 0.8, playfulnessScore: 0.72, professionalismScore: 0.92, conciseness: 0.95,
            verbosity: 0.2, conversationalTone: 0.82, formalTone: 0.88,
            lateNightSuitability: 0.86, workHoursSuitability: 0.92,
        },
        specializations: ['tts', 'voice_generation', 'voice_cloning', 'multilingual_voice', 'premium_voice'],
        accessTier: AccessTier.Premium, creditCost: 5, available: true,
    },
    // ---------------------------------------------------------------
    // ElevenLabs Scribe STT (ELEVENLABS)
    // ---------------------------------------------------------------
    {
        id: 'scribe_v2', name: 'ElevenLabs Scribe STT', provider: 'elevenlabs',
        description: 'High-accuracy speech-to-text. Supports 99 languages with speaker diarization and timestamps.',
        pricing: { inputPer1k: 0.0005, outputPer1k: 0.0 },
        capabilities: {
            maxInputTokens: 0, maxOutputTokens: 128000,
            supportsStreaming: true, supportsVision: false, supportsAudio: true,
            supportsFunctionCalling: false, supportsJsonMode: true, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: true,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.95,
        },
        performance: { avgLatencyMs: 300, reliabilityPercent: 99.5 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.08, [Intent.Analysis]: 0.08, [Intent.Factual]: 0.08,
                [Intent.Conversation]: 0.18, [Intent.Task]: 0.55, [Intent.Brainstorm]: 0.04, [Intent.Translation]: 0.55,
                [Intent.Summarization]: 0.25, [Intent.Extraction]: 0.75,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.0, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.42, [Domain.Business]: 0.62, [Domain.Health]: 0.58, [Domain.Legal]: 0.6,
                [Domain.Finance]: 0.55, [Domain.Education]: 0.65, [Domain.Science]: 0.48, [Domain.CreativeArts]: 0.52,
                [Domain.Lifestyle]: 0.55, [Domain.General]: 0.62, [Domain.Government]: 0.55, [Domain.Relationships]: 0.42,
                [Domain.Shopping]: 0.42, [Domain.EventPlanning]: 0.48, [Domain.Weather]: 0.32, [Domain.Sports]: 0.42,
            },
            complexity: { [Complexity.Quick]: 0.94, [Complexity.Standard]: 0.8, [Complexity.Demanding]: 0.48 },
        },
        humanFactors: {
            empathyScore: 0.38, playfulnessScore: 0.28, professionalismScore: 0.9, conciseness: 0.95,
            verbosity: 0.18, conversationalTone: 0.38, formalTone: 0.88,
            lateNightSuitability: 0.85, workHoursSuitability: 0.92,
        },
        specializations: ['stt', 'transcription', 'multilingual_stt'],
        accessTier: AccessTier.Pro, creditCost: 2, available: true,
    },
    // ---------------------------------------------------------------
    // ElevenLabs Music (ELEVENLABS)
    // ---------------------------------------------------------------
    {
        id: 'elevenlabs-music', name: 'ElevenLabs Music', provider: 'elevenlabs',
        description: 'AI music generation. Create original music tracks from text descriptions.',
        pricing: { inputPer1k: 0.002, outputPer1k: 0.0 },
        capabilities: {
            maxInputTokens: 4096, maxOutputTokens: 0,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.94,
        },
        performance: { avgLatencyMs: 10000, reliabilityPercent: 99.0 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.85, [Intent.Analysis]: 0.0, [Intent.Factual]: 0.0,
                [Intent.Conversation]: 0.0, [Intent.Task]: 0.3, [Intent.Brainstorm]: 0.3, [Intent.Translation]: 0.0,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.1, [Intent.MusicGeneration]: 0.97,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.2, [Domain.Business]: 0.35, [Domain.Health]: 0.2, [Domain.Legal]: 0.1,
                [Domain.Finance]: 0.15, [Domain.Education]: 0.4, [Domain.Science]: 0.15, [Domain.CreativeArts]: 0.96,
                [Domain.Lifestyle]: 0.6, [Domain.General]: 0.45, [Domain.Government]: 0.1, [Domain.Relationships]: 0.35,
                [Domain.Shopping]: 0.25, [Domain.EventPlanning]: 0.55, [Domain.Weather]: 0.1, [Domain.Sports]: 0.3,
            },
            complexity: { [Complexity.Quick]: 0.8, [Complexity.Standard]: 0.75, [Complexity.Demanding]: 0.55 },
        },
        humanFactors: {
            empathyScore: 0.55, playfulnessScore: 0.85, professionalismScore: 0.78, conciseness: 0.95,
            verbosity: 0.1, conversationalTone: 0.4, formalTone: 0.6,
            lateNightSuitability: 0.9, workHoursSuitability: 0.8,
        },
        specializations: ['music_generation', 'audio_generation'],
        accessTier: AccessTier.Pro, creditCost: 5, available: true,
    },
    // ---------------------------------------------------------------
    // ElevenLabs Sound Effects (ELEVENLABS)
    // ---------------------------------------------------------------
    {
        id: 'elevenlabs-sfx', name: 'ElevenLabs Sound Effects', provider: 'elevenlabs',
        description: 'AI sound effects generation. Create custom sound effects from text descriptions.',
        pricing: { inputPer1k: 0.001, outputPer1k: 0.0 },
        capabilities: {
            maxInputTokens: 4096, maxOutputTokens: 0,
            supportsStreaming: false, supportsVision: false, supportsAudio: false,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.9,
        },
        performance: { avgLatencyMs: 5000, reliabilityPercent: 99.2 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.8, [Intent.Analysis]: 0.0, [Intent.Factual]: 0.0,
                [Intent.Conversation]: 0.0, [Intent.Task]: 0.3, [Intent.Brainstorm]: 0.25, [Intent.Translation]: 0.0,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.0,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.05, [Intent.MusicGeneration]: 0.3,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.2, [Domain.Business]: 0.3, [Domain.Health]: 0.15, [Domain.Legal]: 0.08,
                [Domain.Finance]: 0.1, [Domain.Education]: 0.35, [Domain.Science]: 0.15, [Domain.CreativeArts]: 0.92,
                [Domain.Lifestyle]: 0.5, [Domain.General]: 0.4, [Domain.Government]: 0.08, [Domain.Relationships]: 0.2,
                [Domain.Shopping]: 0.2, [Domain.EventPlanning]: 0.5, [Domain.Weather]: 0.15, [Domain.Sports]: 0.3,
            },
            complexity: { [Complexity.Quick]: 0.85, [Complexity.Standard]: 0.7, [Complexity.Demanding]: 0.4 },
        },
        humanFactors: {
            empathyScore: 0.4, playfulnessScore: 0.82, professionalismScore: 0.75, conciseness: 0.95,
            verbosity: 0.1, conversationalTone: 0.35, formalTone: 0.6,
            lateNightSuitability: 0.88, workHoursSuitability: 0.78,
        },
        specializations: ['sound_effects', 'audio_generation'],
        accessTier: AccessTier.Pro, creditCost: 3, available: true,
    },
    // ---------------------------------------------------------------
    // ElevenLabs Voice Isolator (ELEVENLABS)
    // ---------------------------------------------------------------
    {
        id: 'elevenlabs-voice-isolator', name: 'ElevenLabs Voice Isolator', provider: 'elevenlabs',
        description: 'AI voice isolation and noise removal. Separate voice from background noise in audio.',
        pricing: { inputPer1k: 0.0008, outputPer1k: 0.0 },
        capabilities: {
            maxInputTokens: 0, maxOutputTokens: 0,
            supportsStreaming: false, supportsVision: false, supportsAudio: true,
            supportsFunctionCalling: false, supportsJsonMode: false, supportsWebSearch: false,
            supportsReasoning: false, supportsImageGeneration: false,
            supportsExtendedThinking: false, supportsAdaptiveThinking: false,
            supportsCodeExecution: false, supportsTTS: false, supportsSTT: false,
            supportsVideoGeneration: false, supportsRealtimeAudio: false,
            visionScore: 0, audioScore: 0.92,
        },
        performance: { avgLatencyMs: 3000, reliabilityPercent: 99.3 },
        taskStrengths: {
            intents: {
                [Intent.Coding]: 0.0, [Intent.Creative]: 0.3, [Intent.Analysis]: 0.0, [Intent.Factual]: 0.0,
                [Intent.Conversation]: 0.0, [Intent.Task]: 0.6, [Intent.Brainstorm]: 0.0, [Intent.Translation]: 0.0,
                [Intent.Summarization]: 0.0, [Intent.Extraction]: 0.4,
                [Intent.ImageGeneration]: 0.0, [Intent.VideoGeneration]: 0.0,
                [Intent.VoiceGeneration]: 0.2, [Intent.MusicGeneration]: 0.0,
                [Intent.Research]: 0.0, [Intent.Math]: 0.0, [Intent.Planning]: 0.0,
            },
            domains: {
                [Domain.Technology]: 0.3, [Domain.Business]: 0.4, [Domain.Health]: 0.2, [Domain.Legal]: 0.35,
                [Domain.Finance]: 0.15, [Domain.Education]: 0.35, [Domain.Science]: 0.2, [Domain.CreativeArts]: 0.7,
                [Domain.Lifestyle]: 0.4, [Domain.General]: 0.4, [Domain.Government]: 0.3, [Domain.Relationships]: 0.15,
                [Domain.Shopping]: 0.12, [Domain.EventPlanning]: 0.35, [Domain.Weather]: 0.08, [Domain.Sports]: 0.2,
            },
            complexity: { [Complexity.Quick]: 0.88, [Complexity.Standard]: 0.7, [Complexity.Demanding]: 0.35 },
        },
        humanFactors: {
            empathyScore: 0.3, playfulnessScore: 0.25, professionalismScore: 0.82, conciseness: 0.98,
            verbosity: 0.08, conversationalTone: 0.25, formalTone: 0.72,
            lateNightSuitability: 0.85, workHoursSuitability: 0.85,
        },
        specializations: ['audio_processing', 'voice_isolation', 'noise_removal'],
        accessTier: AccessTier.Pro, creditCost: 2, available: true,
    },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

const modelMap = new Map<string, ModelDefinition>(models.map((model) => [model.id, model]));

export function getAllModels(): ModelDefinition[] {
    return [...models];
}

export function getAvailableModels(): ModelDefinition[] {
    return models.filter((m) => m.available);
}

export function getModelsForTier(tier: AccessTier): ModelDefinition[] {
    if (tier === AccessTier.Premium) return models.filter((m) => m.available);
    if (tier === AccessTier.Pro) return models.filter((m) => m.available && m.accessTier !== AccessTier.Premium);
    return models.filter((m) => m.available && m.accessTier === AccessTier.Free);
}

export function isModelAccessible(modelId: string, tier: AccessTier): boolean {
    const model = modelMap.get(modelId);
    if (!model || !model.available) return false;
    if (tier === AccessTier.Premium) return true;
    if (tier === AccessTier.Pro) return model.accessTier !== AccessTier.Premium;
    return model.accessTier === AccessTier.Free;
}

export function getUpgradeModels(currentTier: AccessTier): ModelDefinition[] {
    if (currentTier === AccessTier.Premium) return [];
    if (currentTier === AccessTier.Pro) return models.filter((m) => m.available && m.accessTier === AccessTier.Premium);
    return models.filter((m) => m.available && m.accessTier !== AccessTier.Free);
}

export function getModelById(id: string): ModelDefinition | undefined {
    return modelMap.get(id);
}

export function getModelsByProvider(provider: string): ModelDefinition[] {
    return models.filter((m) => m.provider === provider);
}

export function getProviders(): string[] {
    return [...new Set(models.map((m) => m.provider))];
}

export function getModelCount(): number {
    return models.length;
}

export function getProviderCount(): number {
    return getProviders().length;
}

// ---------------------------------------------------------------------------
// Capability lookups
// ---------------------------------------------------------------------------

export function getModelsBySpecialization(spec: string): ModelDefinition[] {
    return models.filter((m) => m.available && m.specializations.includes(spec as any));
}

export function getModelsByCreditCost(maxCredits: number): ModelDefinition[] {
    return models.filter((m) => m.available && (m.creditCost ?? 0) <= maxCredits);
}

export function getImageGenerationModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.capabilities.supportsImageGeneration === true);
}

// A dedicated image model uses a provider-specific image generation API
// (e.g. Google Imagen API) rather than a streaming chat API that supports
// native image output (e.g. OpenAI Responses API with image_generation tool,
// or Gemini API with responseModalities: ["TEXT", "IMAGE"]).
// Only Imagen models qualify — GPT Image models use the Responses API,
// and Nano Banana models use the Gemini streaming API.
export function isDedicatedImageModel(model: ModelDefinition): boolean {
    return model.specializations.includes('image_generation') &&
        !model.capabilities.supportsVision &&
        !model.capabilities.supportsFunctionCalling;
}

export function getVideoGenerationModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.capabilities.supportsVideoGeneration === true);
}

export function getVoiceModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.capabilities.supportsTTS === true || m.specializations.includes('voice_generation'));
}

export function getSTTModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.capabilities.supportsSTT === true);
}

export function getSearchModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.specializations.includes('web_search') || m.specializations.includes('research'));
}

export function getDeepResearchModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.specializations.includes('deep_research'));
}

export function getReasoningModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.capabilities.supportsReasoning === true || m.specializations.includes('reasoning'));
}

export function getCodingModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.specializations.includes('coding') || m.specializations.includes('agentic_coding'));
}

export function getRealtimeAudioModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.capabilities.supportsRealtimeAudio === true);
}

export function getMusicModels(list?: ModelDefinition[]): ModelDefinition[] {
    return (list ?? models).filter((m) => m.specializations.includes('music_generation'));
}

export function getModelsByModalityCapability(
    list: ModelDefinition[],
    modality: 'vision' | 'audio',
): ModelDefinition[] {
    const key = modality === 'vision' ? 'visionScore' : 'audioScore';
    return [...list]
        .filter((m) => m.capabilities[key] > 0)
        .sort((a, b) => b.capabilities[key] - a.capabilities[key]);
}

// ---------------------------------------------------------------------------
// API response helpers
// ---------------------------------------------------------------------------

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
            supportsWebSearch: model.capabilities.supportsWebSearch ?? false,
        },
        performance: {
            avgLatencyMs: model.performance.avgLatencyMs,
            reliabilityPercent: model.performance.reliabilityPercent,
        },
        accessTier: model.accessTier,
        available: model.available,
    };
}

export function filterModelsByConstraints(
    list: ModelDefinition[],
    constraints: Constraints,
): ModelDefinition[] {
    return list.filter((m) => {
        // Capability constraints
        if (constraints.requireVision && !m.capabilities.supportsVision) return false;
        if (constraints.requireAudio && !m.capabilities.supportsAudio) return false;
        if (constraints.requireStreaming && !m.capabilities.supportsStreaming) return false;
        // Cost constraints
        if (constraints.maxCostPer1kTokens !== undefined && m.pricing.inputPer1k > constraints.maxCostPer1kTokens) return false;
        if (constraints.maxLatencyMs !== undefined && m.performance.avgLatencyMs > constraints.maxLatencyMs) return false;
        // Model allow/exclude lists
        if (constraints.allowedModels && !constraints.allowedModels.includes(m.id)) return false;
        if (constraints.excludedModels && constraints.excludedModels.includes(m.id)) return false;
        return true;
    });
}

export function getPaginatedModels(
    page: number,
    pageSize: number,
    provider?: string,
): { models: ModelInfo[]; total: number; page: number; pageSize: number; totalPages: number } {
    const filtered = provider ? models.filter((m) => m.provider === provider) : models;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = filtered.slice(start, end).map(toModelInfo);
    return { models: paged, total, page, pageSize, totalPages };
}
