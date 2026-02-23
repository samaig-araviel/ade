import { route } from '@/core/engine';
import { Modality, RouteRequest, Mood, EnergyLevel, ResponseStyle } from '@/types';

describe('Performance', () => {
  it('completes simple text routing and returns valid response', () => {
    const request: RouteRequest = {
      prompt: 'Hello, how are you?',
      modality: Modality.Text,
    };

    const response = route(request);

    expect(response.primaryModel).toBeTruthy();
    expect(response.timing.totalMs).toBeDefined();
    expect(typeof response.timing.totalMs).toBe('number');
  });

  it('completes coding prompt routing with valid response', () => {
    const request: RouteRequest = {
      prompt: 'Write a complex algorithm to solve the traveling salesman problem with optimization',
      modality: Modality.Text,
    };

    const response = route(request);

    expect(response.primaryModel).toBeTruthy();
    expect(response.analysis.intent).toBeTruthy();
  });

  it('completes routing with full human context', () => {
    const request: RouteRequest = {
      prompt: 'Help me understand machine learning concepts for my project',
      modality: Modality.Text,
      humanContext: {
        emotionalState: {
          mood: Mood.Calm,
          energyLevel: EnergyLevel.High,
        },
        temporalContext: {
          localTime: '14:30',
          timezone: 'America/New_York',
          dayOfWeek: 'Monday',
          isWorkingHours: true,
        },
        preferences: {
          preferredResponseStyle: ResponseStyle.Detailed,
          preferredModels: ['claude-opus-4-5-20251101'],
        },
      },
      context: {
        userId: 'user_123',
        conversationId: 'conv_456',
        previousModelUsed: 'claude-sonnet-4-6',
        messageCount: 10,
      },
    };

    const response = route(request);

    expect(response.primaryModel).toBeTruthy();
    expect(response.analysis.humanContextUsed).toBe(true);
  });

  it('handles fast-path image routing', () => {
    const request: RouteRequest = {
      prompt: '',
      modality: Modality.Image,
    };

    const response = route(request);

    expect(response.primaryModel).toBeTruthy();
    expect(response.timing.analysisMs).toBe(0);
  });

  it('handles combined modality routing', () => {
    const request: RouteRequest = {
      prompt: 'Analyze this image and explain what you see in detail',
      modality: Modality.TextImage,
    };

    const response = route(request);

    expect(response.primaryModel).toBeTruthy();
  });

  it('handles multiple sequential requests', () => {
    const requests: RouteRequest[] = [
      { prompt: 'Write a function', modality: Modality.Text },
      { prompt: 'Explain quantum physics', modality: Modality.Text },
      { prompt: 'Create a poem', modality: Modality.Text },
      { prompt: 'Debug this code', modality: Modality.Text },
      { prompt: 'Translate to French', modality: Modality.Text },
    ];

    requests.forEach((request) => {
      const response = route(request);
      expect(response.primaryModel).toBeTruthy();
    });
  });

  it('timing breakdown is present', () => {
    const request: RouteRequest = {
      prompt: 'Help me with a complex analysis of market trends and business strategies',
      modality: Modality.Text,
    };

    const response = route(request);

    expect(response.timing.analysisMs).toBeDefined();
    expect(response.timing.scoringMs).toBeDefined();
    expect(response.timing.selectionMs).toBeDefined();
    expect(response.timing.totalMs).toBeDefined();
  });
});
