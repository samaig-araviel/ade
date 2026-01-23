import { route, analyzeOnly } from '@/core/engine';
import { Modality, RouteRequest, Intent, Domain, Mood, EnergyLevel } from '@/types';

describe('Engine', () => {
  describe('route', () => {
    it('returns complete routing response for text request', () => {
      const request: RouteRequest = {
        prompt: 'Write a Python function to sort an array',
        modality: Modality.Text,
      };

      const response = route(request);

      expect(response.decisionId).toMatch(/^dec_/);
      expect(response.primaryModel).toBeTruthy();
      expect(response.primaryModel.id).toBeTruthy();
      expect(response.primaryModel.name).toBeTruthy();
      expect(response.primaryModel.provider).toBeTruthy();
      expect(response.primaryModel.score).toBeGreaterThan(0);
      expect(response.primaryModel.reasoning).toBeTruthy();
      expect(response.primaryModel.reasoning.summary).toBeTruthy();
      expect(response.primaryModel.reasoning.factors.length).toBeGreaterThan(0);
      expect(response.backupModels.length).toBeLessThanOrEqual(2);
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(response.analysis).toBeTruthy();
      expect(response.timing.totalMs).toBeGreaterThanOrEqual(0);
    });

    it('detects coding intent from coding prompt', () => {
      const request: RouteRequest = {
        prompt: 'Debug this JavaScript code and fix the async/await issue',
        modality: Modality.Text,
      };

      const response = route(request);

      expect(response.analysis.intent).toBe(Intent.Coding);
    });

    it('uses fast-path for pure image modality', () => {
      const request: RouteRequest = {
        prompt: '',
        modality: Modality.Image,
      };

      const response = route(request);

      // Fast-path should be very quick
      expect(response.timing.analysisMs).toBe(0);
      // Should select a model with good vision
      expect(response.primaryModel).toBeTruthy();
    });

    it('uses fast-path for pure voice modality', () => {
      const request: RouteRequest = {
        prompt: '',
        modality: Modality.Voice,
      };

      const response = route(request);

      expect(response.timing.analysisMs).toBe(0);
    });

    it('handles combined text+image modality', () => {
      const request: RouteRequest = {
        prompt: 'Describe what you see in this image and explain its significance',
        modality: Modality.TextImage,
      };

      const response = route(request);

      expect(response.analysis.modality).toBe(Modality.TextImage);
      expect(response.primaryModel).toBeTruthy();
    });

    it('respects constraints when filtering models', () => {
      const request: RouteRequest = {
        prompt: 'Help me with a quick question',
        modality: Modality.Text,
        constraints: {
          excludedModels: ['claude-opus-4-5-20251101'],
        },
      };

      const response = route(request);

      expect(response.primaryModel.id).not.toBe('claude-opus-4-5-20251101');
      response.backupModels.forEach((backup) => {
        expect(backup.id).not.toBe('claude-opus-4-5-20251101');
      });
    });

    it('considers human context in scoring', () => {
      const request: RouteRequest = {
        prompt: 'Help me understand this concept',
        modality: Modality.Text,
        humanContext: {
          emotionalState: {
            mood: Mood.Frustrated,
            energyLevel: EnergyLevel.Low,
          },
        },
      };

      const response = route(request);

      expect(response.analysis.humanContextUsed).toBe(true);
    });

    it('provides backup models with reasoning', () => {
      const request: RouteRequest = {
        prompt: 'Write a creative story about space exploration',
        modality: Modality.Text,
      };

      const response = route(request);

      response.backupModels.forEach((backup) => {
        expect(backup.reasoning).toBeTruthy();
        expect(backup.reasoning.summary).toBeTruthy();
        expect(backup.reasoning.factors.length).toBeGreaterThan(0);
      });
    });

    it('extracts keywords from prompt', () => {
      const request: RouteRequest = {
        prompt: 'Build a machine learning model for image classification using TensorFlow',
        modality: Modality.Text,
      };

      const response = route(request);

      expect(response.analysis.keywords.length).toBeGreaterThan(0);
    });

    it('handles conversation context', () => {
      const request: RouteRequest = {
        prompt: 'Continue with the previous topic',
        modality: Modality.Text,
        context: {
          conversationId: 'conv_123',
          previousModelUsed: 'claude-sonnet-4-20250514',
          messageCount: 5,
        },
      };

      const response = route(request);

      // Should complete without error
      expect(response.primaryModel).toBeTruthy();
    });
  });

  describe('analyzeOnly', () => {
    it('returns analysis without scoring', () => {
      const response = analyzeOnly('Write a function in JavaScript', Modality.Text);

      expect(response.analysis).toBeTruthy();
      expect(response.analysis.intent).toBe(Intent.Coding);
      expect(response.timing.analysisMs).toBeGreaterThanOrEqual(0);
    });

    it('handles various intents', () => {
      // Test that analysis produces valid results
      const response1 = analyzeOnly('Write a poem about love', Modality.Text);
      expect(response1.analysis.intent).toBe(Intent.Creative);

      const response2 = analyzeOnly('Analyze this dataset', Modality.Text);
      expect(response2.analysis.intent).toBe(Intent.Analysis);

      const response3 = analyzeOnly('What is quantum computing?', Modality.Text);
      expect(response3.analysis.intent).toBe(Intent.Factual);

      const response4 = analyzeOnly('Translate this to Spanish', Modality.Text);
      expect(response4.analysis.intent).toBe(Intent.Translation);
    });
  });
});
