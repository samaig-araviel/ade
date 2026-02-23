import { selectModels, selectFallback } from '@/core/selector';
import { getAvailableModels } from '@/models';
import { ModelScore, Intent, Domain, Complexity } from '@/types';

describe('Selector', () => {
  const models = getAvailableModels();

  // Create mock scored models (sorted descending by score)
  function createMockScores(scores: number[]): ModelScore[] {
    const modelScores = scores.map((score, index) => ({
      model: models[index]!,
      factors: [
        {
          name: 'Test Factor',
          score: score,
          weight: 1.0,
          weightedScore: score,
          detail: 'Test detail',
        },
      ],
      compositeScore: score,
    }));
    // Sort descending by score (as the real scorer would)
    return modelScores.sort((a, b) => b.compositeScore - a.compositeScore);
  }

  describe('selectModels', () => {
    it('selects the highest scoring model as primary', () => {
      const scores = createMockScores([0.8, 0.9, 0.7, 0.6, 0.5]);
      const result = selectModels(scores);

      expect(result.primary.compositeScore).toBe(0.9);
    });

    it('selects up to 2 backup models', () => {
      const scores = createMockScores([0.9, 0.8, 0.7, 0.6, 0.5]);
      const result = selectModels(scores);

      expect(result.backups.length).toBe(2);
      expect(result.backups[0]!.compositeScore).toBe(0.8);
      expect(result.backups[1]!.compositeScore).toBe(0.7);
    });

    it('returns empty backups when only one model available', () => {
      const scores = createMockScores([0.9]);
      const result = selectModels(scores);

      expect(result.primary.compositeScore).toBe(0.9);
      expect(result.backups.length).toBe(0);
    });

    it('returns 1 backup when only 2 models available', () => {
      const scores = createMockScores([0.9, 0.8]);
      const result = selectModels(scores);

      expect(result.backups.length).toBe(1);
    });

    it('throws error when no models available', () => {
      expect(() => selectModels([])).toThrow('No models available for selection');
    });

    it('calculates high confidence for large margin', () => {
      // First at 0.95, second at 0.70 = margin of 0.25
      const scores = createMockScores([0.95, 0.70, 0.60]);
      const result = selectModels(scores);

      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('calculates lower confidence for small margin', () => {
      // First at 0.80, second at 0.79 = margin of 0.01
      const scores = createMockScores([0.80, 0.79, 0.78]);
      const result = selectModels(scores);

      expect(result.confidence).toBeLessThan(0.7);
    });

    it('returns 0.95 confidence for single model', () => {
      const scores = createMockScores([0.85]);
      const result = selectModels(scores);

      expect(result.confidence).toBe(0.95);
    });
  });

  describe('selectFallback', () => {
    it('returns the most generally capable model', () => {
      const fallback = selectFallback(models);

      expect(fallback).not.toBeNull();
      expect(fallback!.id).toBeTruthy();
    });

    it('returns null when no models available', () => {
      const fallback = selectFallback([]);
      expect(fallback).toBeNull();
    });

    it('selects based on average task strength', () => {
      const fallback = selectFallback(models);

      // Calculate average strength for fallback
      const intentScores = Object.values(fallback!.taskStrengths.intents);
      const domainScores = Object.values(fallback!.taskStrengths.domains);
      const fallbackAvg = [...intentScores, ...domainScores].reduce((a, b) => a + b, 0) /
        (intentScores.length + domainScores.length);

      // Should be relatively high (with rebalanced scores, 0.75 is the threshold)
      expect(fallbackAvg).toBeGreaterThan(0.75);
    });
  });
});
