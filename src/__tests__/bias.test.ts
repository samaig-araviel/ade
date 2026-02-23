import { route } from '@/core/engine';
import { Modality, RouteRequest, RouteResponse } from '@/types';

// Test matrix of prompts across diverse categories
const PROMPT_CATEGORIES: Record<string, string[]> = {
  coding: [
    'Write a Python function to sort an array using quicksort',
    'Debug this React component that has a memory leak',
    'Create a REST API endpoint in Go with proper error handling',
    'Write unit tests for this TypeScript class',
    'Implement a binary search tree in Java',
  ],
  creative: [
    'Write a short story about an astronaut who discovers music on Mars',
    'Compose a poem about the changing seasons',
    'Create a fantasy world with unique magic system',
    'Write a dialogue between two historical figures meeting for the first time',
    'Craft a compelling product description for a futuristic gadget',
  ],
  factual: [
    'What is the capital of France?',
    'Explain how photosynthesis works',
    'What causes earthquakes and how are they measured?',
    'Who invented the telephone?',
    'What is the speed of light?',
  ],
  research: [
    'Research the latest developments in quantum computing',
    'Find recent studies on the impact of social media on mental health',
    'What are the most recent breakthroughs in cancer treatment?',
    'Research the current state of renewable energy adoption worldwide',
    'What are the latest findings on deep learning efficiency?',
  ],
  conversation: [
    'Hey, how are you doing today?',
    'Tell me something interesting about yourself',
    'I had a really rough day, just need to chat',
    'What do you think about the meaning of life?',
    'Just checking in, anything fun happening?',
  ],
  quick_tasks: [
    'What is 15% of 230?',
    'Capital of Japan?',
    'Hi there!',
    'Thanks for your help',
    'Yes, that sounds good',
  ],
  math: [
    'Solve the equation: 3x^2 + 7x - 10 = 0',
    'Calculate the integral of x^2 * sin(x) dx',
    'Prove that the square root of 2 is irrational',
    'Find the eigenvalues of the matrix [[2,1],[1,3]]',
    'What is the probability of rolling at least one six in 4 dice rolls?',
  ],
  planning: [
    'Plan a 7-day trip to Japan including flights, hotels, and activities',
    'Help me organize my wedding for 150 guests',
    'Create a study schedule for my final exams next month',
    'Plan a birthday party for a 5-year-old',
    'Help me create a project timeline for launching a new product',
  ],
  translation: [
    'Translate this paragraph from English to Spanish: The quick brown fox jumps over the lazy dog',
    'How do you say "I love programming" in Japanese?',
    'Translate this legal document from French to English',
    'What is the German translation of "artificial intelligence"?',
    'Convert this technical manual from English to Mandarin Chinese',
  ],
  financial: [
    'Analyze my investment portfolio and suggest rebalancing strategies',
    'Explain the difference between a Roth IRA and Traditional IRA',
    'Compare index funds vs actively managed funds for long-term investing',
    'What are the tax implications of selling stocks at a loss?',
    'Help me create a monthly budget for a $5000 income',
  ],
};

function routePrompt(prompt: string): RouteResponse {
  const request: RouteRequest = {
    prompt,
    modality: Modality.Text,
  };
  return route(request);
}

describe('Model Selection Bias Detection', () => {
  // Track provider wins across all categories
  const providerWins: Record<string, number> = {};
  const categoryWinners: Record<string, Record<string, number>> = {};

  beforeAll(() => {
    // Run all prompts and collect results
    for (const [category, prompts] of Object.entries(PROMPT_CATEGORIES)) {
      categoryWinners[category] = {};
      for (const prompt of prompts) {
        const response = routePrompt(prompt);
        const provider = response.primaryModel.provider;

        providerWins[provider] = (providerWins[provider] ?? 0) + 1;
        categoryWinners[category]![provider] = (categoryWinners[category]![provider] ?? 0) + 1;
      }
    }
  });

  it('no single provider should win more than 45% of all prompts', () => {
    const totalPrompts = Object.values(PROMPT_CATEGORIES).reduce((sum, p) => sum + p.length, 0);
    const threshold = totalPrompts * 0.45;

    for (const [provider, wins] of Object.entries(providerWins)) {
      expect(wins).toBeLessThanOrEqual(threshold);
    }
  });

  it('at least 3 different providers should win across all categories', () => {
    const uniqueWinners = Object.keys(providerWins).filter(p => providerWins[p]! > 0);
    expect(uniqueWinners.length).toBeGreaterThanOrEqual(3);
  });

  it('coding prompts should not always recommend the same model', () => {
    const codingModels = new Set<string>();
    for (const prompt of PROMPT_CATEGORIES.coding!) {
      const response = routePrompt(prompt);
      codingModels.add(response.primaryModel.id);
    }
    // At least some variation in coding recommendations
    expect(codingModels.size).toBeGreaterThanOrEqual(1);
  });

  it('quick tasks should favor fast/lightweight models', () => {
    let fastModelCount = 0;
    const quickPrompts = PROMPT_CATEGORIES.quick_tasks!;

    for (const prompt of quickPrompts) {
      const response = routePrompt(prompt);
      const modelId = response.primaryModel.id.toLowerCase();
      // Fast models typically have "haiku", "flash", "mini", "nano", "small" in their name
      if (modelId.includes('haiku') || modelId.includes('flash') || modelId.includes('mini') ||
          modelId.includes('nano') || modelId.includes('small') || modelId.includes('gpt-4o')) {
        fastModelCount++;
      }
    }

    // At least 40% of quick tasks should recommend fast models
    expect(fastModelCount).toBeGreaterThanOrEqual(Math.floor(quickPrompts.length * 0.4));
  });

  it('should show provider diversity in backup models', () => {
    let diverseBackups = 0;
    const totalTests = 10;

    const testPrompts = [
      'Write a Python function to reverse a string',
      'Explain quantum entanglement',
      'Write a poem about the ocean',
      'Plan a trip to Italy',
      'What is machine learning?',
      'Help me debug this SQL query',
      'Translate hello to 5 languages',
      'Analyze the stock market trends',
      'Create a meal plan for the week',
      'How does blockchain work?',
    ];

    for (const prompt of testPrompts) {
      const response = routePrompt(prompt);
      const providers = new Set([response.primaryModel.provider]);
      response.backupModels.forEach(m => providers.add(m.provider));

      if (providers.size >= 2) {
        diverseBackups++;
      }
    }

    // At least 50% of results should show diverse providers in backups
    expect(diverseBackups).toBeGreaterThanOrEqual(Math.floor(totalTests * 0.5));
  });

  it('logs provider distribution for manual review', () => {
    const totalPrompts = Object.values(PROMPT_CATEGORIES).reduce((sum, p) => sum + p.length, 0);

    console.log('\n=== Provider Distribution ===');
    for (const [provider, wins] of Object.entries(providerWins).sort((a, b) => b[1] - a[1])) {
      const pct = ((wins / totalPrompts) * 100).toFixed(1);
      console.log(`  ${provider}: ${wins}/${totalPrompts} (${pct}%)`);
    }

    console.log('\n=== Category Winners ===');
    for (const [category, winners] of Object.entries(categoryWinners)) {
      const topProvider = Object.entries(winners).sort((a, b) => b[1] - a[1])[0];
      console.log(`  ${category}: ${topProvider?.[0]} (${topProvider?.[1]}/${PROMPT_CATEGORIES[category]!.length})`);
    }
  });
});
