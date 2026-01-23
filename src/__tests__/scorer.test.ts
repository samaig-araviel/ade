import {
  calculateTaskFitness,
  calculateModalityFitness,
  calculateCostEfficiency,
  calculateSpeed,
  calculateConversationCoherence,
  calculateUserPreference,
  calculateHumanContextFit,
  scoreModel,
  scoreAllModels,
} from '@/core/scorer';
import { getAvailableModels } from '@/models';
import {
  QueryAnalysis,
  Intent,
  Domain,
  Complexity,
  Tone,
  Modality,
  Mood,
  EnergyLevel,
  ResponseStyle,
} from '@/types';

describe('Scorer', () => {
  const models = getAvailableModels();
  const testModel = models[0]!;

  const baseAnalysis: QueryAnalysis = {
    intent: Intent.Coding,
    domain: Domain.Technology,
    complexity: Complexity.Standard,
    tone: Tone.Focused,
    modality: Modality.Text,
    keywords: ['code', 'function'],
    humanContextUsed: false,
  };

  describe('calculateTaskFitness', () => {
    it('calculates score based on intent, domain, and complexity', () => {
      const result = calculateTaskFitness(testModel, baseAnalysis);

      expect(result.name).toBe('Task Fitness');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.detail).toBeTruthy();
    });

    it('gives higher scores for matching strengths', () => {
      // Claude Opus should be strong at coding
      const claudeOpus = models.find((m) => m.id === 'claude-opus-4-5-20251101')!;
      const codingAnalysis = { ...baseAnalysis, intent: Intent.Coding };
      const result = calculateTaskFitness(claudeOpus, codingAnalysis);

      expect(result.score).toBeGreaterThan(0.85);
    });
  });

  describe('calculateModalityFitness', () => {
    it('returns 1.0 for text-only requests', () => {
      const result = calculateModalityFitness(testModel, baseAnalysis);
      expect(result.score).toBe(1.0);
    });

    it('uses vision score for image modality', () => {
      const imageAnalysis = { ...baseAnalysis, modality: Modality.Image };
      const result = calculateModalityFitness(testModel, imageAnalysis);

      if (testModel.capabilities.supportsVision) {
        expect(result.score).toBe(testModel.capabilities.visionScore);
      } else {
        expect(result.score).toBe(0);
      }
    });

    it('uses audio score for voice modality', () => {
      const voiceAnalysis = { ...baseAnalysis, modality: Modality.Voice };
      const result = calculateModalityFitness(testModel, voiceAnalysis);

      if (testModel.capabilities.supportsAudio) {
        expect(result.score).toBe(testModel.capabilities.audioScore);
      } else {
        expect(result.score).toBe(0);
      }
    });
  });

  describe('calculateCostEfficiency', () => {
    it('gives highest score to cheapest model', () => {
      // Gemini Flash-Lite is the cheapest
      const cheapestModel = models.reduce((min, m) =>
        (m.pricing.inputPer1k + m.pricing.outputPer1k) < (min.pricing.inputPer1k + min.pricing.outputPer1k)
          ? m : min
      );

      const result = calculateCostEfficiency(cheapestModel, models);
      expect(result.score).toBeCloseTo(1.0, 1);
    });

    it('gives lowest score to most expensive model', () => {
      const mostExpensive = models.reduce((max, m) =>
        (m.pricing.inputPer1k + m.pricing.outputPer1k) > (max.pricing.inputPer1k + max.pricing.outputPer1k)
          ? m : max
      );

      const result = calculateCostEfficiency(mostExpensive, models);
      expect(result.score).toBeCloseTo(0.0, 1);
    });
  });

  describe('calculateSpeed', () => {
    it('gives highest score to fastest model', () => {
      const fastest = models.reduce((min, m) =>
        m.performance.avgLatencyMs < min.performance.avgLatencyMs ? m : min
      );

      const result = calculateSpeed(fastest, models);
      expect(result.score).toBeCloseTo(1.0, 1);
    });

    it('gives lowest score to slowest model', () => {
      const slowest = models.reduce((max, m) =>
        m.performance.avgLatencyMs > max.performance.avgLatencyMs ? m : max
      );

      const result = calculateSpeed(slowest, models);
      expect(result.score).toBeCloseTo(0.0, 1);
    });
  });

  describe('calculateConversationCoherence', () => {
    it('returns 0.5 for new conversations', () => {
      const result = calculateConversationCoherence(testModel, undefined);
      expect(result.score).toBe(0.5);
    });

    it('returns 1.0 when same model was used previously', () => {
      const result = calculateConversationCoherence(testModel, {
        previousModelUsed: testModel.id,
      });
      expect(result.score).toBe(1.0);
    });

    it('returns 0.7 for same provider', () => {
      const anthropicModel = models.find((m) => m.provider === 'anthropic')!;
      const result = calculateConversationCoherence(anthropicModel, {
        previousModelUsed: 'anthropic-some-other-model',
      });
      expect(result.score).toBe(0.7);
    });

    it('returns 0.4 for different provider', () => {
      const anthropicModel = models.find((m) => m.provider === 'anthropic')!;
      const result = calculateConversationCoherence(anthropicModel, {
        previousModelUsed: 'gpt-4o',
      });
      expect(result.score).toBe(0.4);
    });
  });

  describe('calculateUserPreference', () => {
    it('returns 0.5 for no preferences', () => {
      const result = calculateUserPreference(testModel, undefined);
      expect(result.score).toBe(0.5);
    });

    it('boosts score for preferred models', () => {
      const result = calculateUserPreference(testModel, {
        preferences: { preferredModels: [testModel.id] },
      });
      expect(result.score).toBe(0.9);
    });

    it('reduces score for avoided models', () => {
      const result = calculateUserPreference(testModel, {
        preferences: { avoidModels: [testModel.id] },
      });
      expect(result.score).toBeCloseTo(0.1, 2);
    });
  });

  describe('calculateHumanContextFit', () => {
    it('returns null when no human context provided', () => {
      const result = calculateHumanContextFit(testModel, undefined);
      expect(result).toBeNull();
    });

    it('considers mood when frustrated', () => {
      const result = calculateHumanContextFit(testModel, {
        emotionalState: { mood: Mood.Frustrated },
      });

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Human Context Fit');
    });

    it('considers energy level', () => {
      const result = calculateHumanContextFit(testModel, {
        emotionalState: { energyLevel: EnergyLevel.Low },
      });

      expect(result).not.toBeNull();
    });

    it('considers response style preference', () => {
      const result = calculateHumanContextFit(testModel, {
        preferences: { preferredResponseStyle: ResponseStyle.Concise },
      });

      expect(result).not.toBeNull();
    });

    it('considers time context', () => {
      const result = calculateHumanContextFit(testModel, {
        temporalContext: { localTime: '23:30' }, // Late night
      });

      expect(result).not.toBeNull();
    });
  });

  describe('scoreModel', () => {
    it('calculates composite score from all factors', () => {
      const result = scoreModel(testModel, {
        analysis: baseAnalysis,
        allModels: models,
      });

      expect(result.model).toBe(testModel);
      expect(result.factors.length).toBeGreaterThan(0);
      expect(result.compositeScore).toBeGreaterThan(0);
      expect(result.compositeScore).toBeLessThanOrEqual(1);
    });

    it('includes human context factor when context provided', () => {
      const result = scoreModel(testModel, {
        analysis: { ...baseAnalysis, humanContextUsed: true },
        humanContext: { emotionalState: { mood: Mood.Happy } },
        allModels: models,
      });

      const hasHumanContextFactor = result.factors.some(
        (f) => f.name === 'Human Context Fit'
      );
      expect(hasHumanContextFactor).toBe(true);
    });
  });

  describe('scoreAllModels', () => {
    it('scores and sorts all models', () => {
      const results = scoreAllModels({
        analysis: baseAnalysis,
        allModels: models,
      });

      expect(results.length).toBe(models.length);

      // Check sorted descending by score
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.compositeScore).toBeGreaterThanOrEqual(
          results[i]!.compositeScore
        );
      }
    });
  });
});
