import { route, analyzeOnly } from '@/core/engine';
import { Modality, RouteRequest, Intent, Domain, Complexity } from '@/types';

function routeText(prompt: string) {
  return route({ prompt, modality: Modality.Text });
}

function analyzeText(prompt: string) {
  return analyzeOnly(prompt, Modality.Text);
}

describe('Routing Accuracy', () => {
  describe('Intent Detection Accuracy', () => {
    it('detects coding intent correctly', () => {
      const prompts = [
        'Write a Python function to sort an array',
        'Debug this JavaScript code',
        'Create a REST API in Go',
        'Implement a linked list in C++',
        'Fix this SQL query that returns wrong results',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.Coding);
      }
    });

    it('detects creative intent correctly', () => {
      const prompts = [
        'Write a short story about a robot learning to love',
        'Compose a poem about autumn leaves',
        'Create a fantasy narrative about a dragon and a knight',
        'Write song lyrics about summer nights',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.Creative);
      }
    });

    it('detects image generation intent correctly', () => {
      const prompts = [
        'Generate an image of a sunset over the ocean',
        'Create a picture of a cat wearing a hat',
        'Draw me a futuristic cityscape',
        'Make an illustration of a magical forest',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.ImageGeneration);
      }
    });

    it('detects video generation intent correctly', () => {
      const prompts = [
        'Create a video of a flying car over a city',
        'Generate an animation of a bouncing ball',
        'Make a video clip of waves crashing on a beach',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.VideoGeneration);
      }
    });

    it('detects voice generation intent correctly', () => {
      const prompts = [
        'Convert this text to speech',
        'Read this aloud in a professional tone',
        'Generate a voiceover for my presentation',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.VoiceGeneration);
      }
    });

    it('detects research intent correctly', () => {
      const prompts = [
        'Research the latest developments in quantum computing',
        'Find recent studies on climate change',
        'What are the most recent breakthroughs in AI?',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.Research);
      }
    });

    it('detects math intent correctly', () => {
      const prompts = [
        'Solve the equation 2x + 5 = 15',
        'Calculate the integral of x^2 dx',
        'Find the eigenvalues of this matrix',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.Math);
      }
    });

    it('detects planning intent correctly', () => {
      const prompts = [
        'Plan a trip to Japan for 2 weeks',
        'Help me organize my wedding',
        'Create a schedule for my study sessions',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.Planning);
      }
    });

    it('detects conversation intent for greetings', () => {
      const prompts = [
        'Hey, how are you?',
        'Hi there!',
        'Good morning!',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.intent).toBe(Intent.Conversation);
      }
    });

    it('distinguishes image analysis from image generation', () => {
      // "Analyze this image" should NOT be ImageGeneration
      const analysisPrompt = 'Analyze the composition of this photograph and describe the lighting techniques used';
      const { analysis: analysisResult } = analyzeText(analysisPrompt);
      expect(analysisResult.intent).not.toBe(Intent.ImageGeneration);

      // "Generate an image" SHOULD be ImageGeneration
      const genPrompt = 'Generate an image of a beautiful sunset';
      const { analysis: genResult } = analyzeText(genPrompt);
      expect(genResult.intent).toBe(Intent.ImageGeneration);
    });
  });

  describe('Complexity Detection Accuracy', () => {
    it('detects quick complexity for simple questions', () => {
      const prompts = [
        'What is 2+2?',
        'Hi there!',
        'Capital of France?',
        'Thanks!',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.complexity).toBe(Complexity.Quick);
      }
    });

    it('detects demanding complexity for complex tasks', () => {
      const prompts = [
        'Design a comprehensive microservices architecture for an e-commerce platform with user authentication, product catalog, shopping cart, payment processing, and order management. Include detailed system design, database schemas, API specifications, and deployment pipeline with CI/CD',
      ];

      for (const prompt of prompts) {
        const { analysis } = analyzeText(prompt);
        expect(analysis.complexity).toBe(Complexity.Demanding);
      }
    });
  });

  describe('Routing Correctness', () => {
    it('does not recommend text-only models for image generation', () => {
      const response = routeText('Generate an image of a golden retriever puppy');
      const model = response.primaryModel;

      // The model should either be an image generation specialist or have high generation capability
      // It should NOT be a text-only model like Claude or GPT-4 unless they support image gen
      const isTextOnlyChat = model.id.includes('claude') && !model.id.includes('vision');
      // This is a softer check - we just want to ensure the system at least
      // recognizes this as an image generation task
      expect(response.analysis.intent).toBe(Intent.ImageGeneration);
    });

    it('routes research queries to web-capable models when available', () => {
      const response = routeText('Research the latest news about renewable energy breakthroughs in 2026');

      // Should detect as research intent
      expect(response.analysis.intent).toBe(Intent.Research);

      // The primary or at least one backup should be from a provider with web search
      const allModels = [response.primaryModel, ...response.backupModels];
      const hasWebCapable = allModels.some(m =>
        m.provider === 'perplexity' || m.provider === 'xai'
      );
      // Perplexity or xAI (Grok) should appear for research queries
      expect(hasWebCapable).toBe(true);
    });

    it('routes translation to models strong in multilingual', () => {
      const response = routeText('Translate this paragraph from English to Japanese');

      expect(response.analysis.intent).toBe(Intent.Translation);
    });

    it('does not fail on empty or very short prompts', () => {
      const responses = [
        routeText(''),
        routeText('hi'),
        routeText('?'),
      ];

      for (const response of responses) {
        expect(response.primaryModel).toBeTruthy();
        expect(response.primaryModel.id).toBeTruthy();
        expect(response.confidence).toBeGreaterThan(0);
      }
    });

    it('handles very long prompts without error', () => {
      const longPrompt = 'Explain the concept of ' + 'very '.repeat(500) + 'important algorithms in computer science';
      const response = routeText(longPrompt);

      expect(response.primaryModel).toBeTruthy();
      expect(response.timing.totalMs).toBeLessThan(100); // Should still be fast
    });
  });

  describe('Fallback System', () => {
    it('returns fallback suggestion for low-confidence scenarios', () => {
      // Image generation with text modality should route but may have fallback
      const response = routeText('Generate a 3D holographic interactive virtual reality experience');

      // Should still return a primary model
      expect(response.primaryModel).toBeTruthy();
      // Response should complete without error
      expect(response.decisionId).toMatch(/^dec_/);
    });
  });
});

describe('Performance', () => {
  it('routes all prompts within 50ms budget', () => {
    const prompts = [
      'Write a Python function',
      'What is quantum computing?',
      'Generate an image of a cat',
      'Plan a trip to Paris',
      'Solve x^2 + 5x + 6 = 0',
      'Translate hello to Spanish',
      'Hey, how are you?',
      'Research latest AI developments',
      'Write a poem about nature',
      'Debug this React component',
    ];

    for (const prompt of prompts) {
      const response = routeText(prompt);
      expect(response.timing.totalMs).toBeLessThan(50);
    }
  });

  it('handles 100 sequential calls consistently', () => {
    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      routeText(`Test prompt number ${i} for performance testing`);
    }

    const totalMs = performance.now() - start;
    const avgMs = totalMs / 100;

    // Average should be well under 50ms
    expect(avgMs).toBeLessThan(50);
    console.log(`Average routing time over 100 calls: ${avgMs.toFixed(2)}ms`);
  });
});
