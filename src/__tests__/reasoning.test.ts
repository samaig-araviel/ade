import {
  generateReasoning,
  generateFastPathReasoning,
  generateFallbackReasoning,
} from '@/core/reasoning';
import { getAvailableModels } from '@/models';
import {
  ModelScore,
  QueryAnalysis,
  Intent,
  Domain,
  Complexity,
  Tone,
  Modality,
  FactorImpact,
} from '@/types';

describe('Reasoning Generator', () => {
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

  const mockModelScore: ModelScore = {
    model: testModel,
    factors: [
      {
        name: 'Task Fitness',
        score: 0.95,
        weight: 0.4,
        weightedScore: 0.38,
        detail: 'Excels at coding tasks with strong technology knowledge',
      },
      {
        name: 'Modality Fitness',
        score: 1.0,
        weight: 0.15,
        weightedScore: 0.15,
        detail: 'Text-only request - all models supported',
      },
      {
        name: 'Cost Efficiency',
        score: 0.3,
        weight: 0.15,
        weightedScore: 0.045,
        detail: 'Premium pricing at $0.045/1K tokens',
      },
      {
        name: 'Speed',
        score: 0.2,
        weight: 0.1,
        weightedScore: 0.02,
        detail: 'Slower responses (~2.5s average)',
      },
    ],
    compositeScore: 0.85,
  };

  describe('generateReasoning', () => {
    it('generates reasoning for primary model', () => {
      const reasoning = generateReasoning(mockModelScore, baseAnalysis, true);

      expect(reasoning.summary).toBeTruthy();
      expect(reasoning.summary.length).toBeGreaterThan(20);
      expect(reasoning.factors.length).toBe(mockModelScore.factors.length);
    });

    it('generates different reasoning for backup model', () => {
      const primaryReasoning = generateReasoning(mockModelScore, baseAnalysis, true);
      const backupReasoning = generateReasoning(mockModelScore, baseAnalysis, false, 1);

      expect(backupReasoning.summary).not.toBe(primaryReasoning.summary);
    });

    it('converts factors to reasoning factors with impact', () => {
      const reasoning = generateReasoning(mockModelScore, baseAnalysis, true);

      reasoning.factors.forEach((factor) => {
        expect(factor.name).toBeTruthy();
        expect([FactorImpact.Positive, FactorImpact.Neutral, FactorImpact.Negative]).toContain(
          factor.impact
        );
        expect(factor.weight).toBeGreaterThanOrEqual(0);
        expect(factor.detail).toBeTruthy();
      });
    });

    it('marks high scores as positive impact', () => {
      const reasoning = generateReasoning(mockModelScore, baseAnalysis, true);

      const taskFactor = reasoning.factors.find((f) => f.name === 'Task Fitness');
      expect(taskFactor?.impact).toBe(FactorImpact.Positive);
    });

    it('marks low scores as negative impact', () => {
      const reasoning = generateReasoning(mockModelScore, baseAnalysis, true);

      const speedFactor = reasoning.factors.find((f) => f.name === 'Speed');
      expect(speedFactor?.impact).toBe(FactorImpact.Negative);
    });

    it('includes model name in summary', () => {
      const reasoning = generateReasoning(mockModelScore, baseAnalysis, true);
      expect(reasoning.summary).toContain(testModel.name);
    });

    it('varies language based on intent', () => {
      const codingReasoning = generateReasoning(mockModelScore, baseAnalysis, true);

      const creativeAnalysis = { ...baseAnalysis, intent: Intent.Creative };
      const creativeReasoning = generateReasoning(mockModelScore, creativeAnalysis, true);

      // Summaries should mention the different intents
      expect(codingReasoning.summary.toLowerCase()).toContain('coding');
      expect(creativeReasoning.summary.toLowerCase()).toContain('creative');
    });
  });

  describe('generateFastPathReasoning', () => {
    it('generates reasoning for vision fast-path', () => {
      const visionScore: ModelScore = {
        model: testModel,
        factors: [
          {
            name: 'Modality Capability',
            score: 0.95,
            weight: 1.0,
            weightedScore: 0.95,
            detail: '95% vision capability',
          },
        ],
        compositeScore: 0.95,
      };

      const reasoning = generateFastPathReasoning(visionScore, 'vision');

      expect(reasoning.summary).toContain(testModel.name);
      expect(reasoning.summary.toLowerCase()).toContain('image');
      expect(reasoning.factors.length).toBe(1);
      expect(reasoning.factors[0]!.impact).toBe(FactorImpact.Positive);
    });

    it('generates reasoning for audio fast-path', () => {
      const audioScore: ModelScore = {
        model: testModel,
        factors: [
          {
            name: 'Modality Capability',
            score: 0.92,
            weight: 1.0,
            weightedScore: 0.92,
            detail: '92% audio capability',
          },
        ],
        compositeScore: 0.92,
      };

      const reasoning = generateFastPathReasoning(audioScore, 'audio');

      expect(reasoning.summary).toContain(testModel.name);
      expect(reasoning.summary.toLowerCase()).toContain('audio');
    });
  });

  describe('generateFallbackReasoning', () => {
    it('generates fallback reasoning', () => {
      const reasoning = generateFallbackReasoning(testModel);

      expect(reasoning.summary).toContain(testModel.name);
      expect(reasoning.summary.toLowerCase()).toContain('fallback');
      expect(reasoning.factors.length).toBe(1);
      expect(reasoning.factors[0]!.name).toBe('Fallback Selection');
    });
  });
});
