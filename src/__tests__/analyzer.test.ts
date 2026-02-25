import {
  detectIntent,
  detectDomain,
  detectComplexity,
  detectTone,
  detectWebSearchRequired,
  extractPromptKeywords,
  parseModality,
  analyze,
} from '@/core/analyzer';
import { Intent, Domain, Complexity, Tone, Modality } from '@/types';

describe('Analyzer', () => {
  describe('detectIntent', () => {
    it('detects coding intent from code-related prompts', () => {
      expect(detectIntent('Write a function to sort an array')).toBe(Intent.Coding);
      expect(detectIntent('Debug this JavaScript code')).toBe(Intent.Coding);
      expect(detectIntent('Help me implement a REST API')).toBe(Intent.Coding);
    });

    it('detects creative intent from creative prompts', () => {
      expect(detectIntent('Write me a short story about space')).toBe(Intent.Creative);
      expect(detectIntent('Create a poem about nature')).toBe(Intent.Creative);
    });

    it('detects analysis intent from analytical prompts', () => {
      expect(detectIntent('Analyze this data and find patterns')).toBe(Intent.Analysis);
      expect(detectIntent('Compare the pros and cons of these approaches')).toBe(Intent.Analysis);
    });

    it('detects factual intent from questions', () => {
      expect(detectIntent('What is the capital of France?')).toBe(Intent.Factual);
      expect(detectIntent('Who invented the telephone?')).toBe(Intent.Factual);
    });

    it('detects brainstorm intent from idea-generating prompts', () => {
      expect(detectIntent('Give me some ideas for a startup')).toBe(Intent.Brainstorm);
      expect(detectIntent('Brainstorm solutions for this problem')).toBe(Intent.Brainstorm);
    });

    it('detects translation intent from translation requests', () => {
      expect(detectIntent('Translate this to Spanish')).toBe(Intent.Translation);
      expect(detectIntent('Convert this English text to French')).toBe(Intent.Translation);
    });

    it('detects summarization intent from summary requests', () => {
      expect(detectIntent('Please summarize and condense this long article')).toBe(Intent.Summarization);
    });

    it('detects extraction intent from extraction requests', () => {
      expect(detectIntent('Extract and pull all entities and names from the text')).toBe(Intent.Extraction);
    });
  });

  describe('detectDomain', () => {
    it('detects technology domain', () => {
      expect(detectDomain('How does machine learning work?')).toBe(Domain.Technology);
      expect(detectDomain('Explain cloud computing architecture')).toBe(Domain.Technology);
    });

    it('detects business domain', () => {
      expect(detectDomain('Help me with my marketing strategy')).toBe(Domain.Business);
      expect(detectDomain('Explain corporate governance')).toBe(Domain.Business);
    });

    it('detects health domain', () => {
      expect(detectDomain('What are the symptoms of diabetes?')).toBe(Domain.Health);
      expect(detectDomain('Explain this medical diagnosis')).toBe(Domain.Health);
    });

    it('detects legal domain', () => {
      expect(detectDomain('What does this contract clause mean?')).toBe(Domain.Legal);
      expect(detectDomain('Explain copyright law')).toBe(Domain.Legal);
    });

    it('detects finance domain', () => {
      expect(detectDomain('How do I invest in stocks?')).toBe(Domain.Finance);
      expect(detectDomain('Explain compound interest')).toBe(Domain.Finance);
    });

    it('detects education domain', () => {
      expect(detectDomain('Help me study for my exam')).toBe(Domain.Education);
      expect(detectDomain('Explain this academic concept')).toBe(Domain.Education);
    });

    it('detects science domain', () => {
      expect(detectDomain('Explain quantum physics')).toBe(Domain.Science);
      expect(detectDomain('How does evolution work?')).toBe(Domain.Science);
    });

    it('defaults to general domain for ambiguous prompts', () => {
      expect(detectDomain('Hello there')).toBe(Domain.General);
    });
  });

  describe('detectComplexity', () => {
    it('detects quick complexity for simple requests', () => {
      expect(detectComplexity('Hi')).toBe(Complexity.Quick);
      expect(detectComplexity('Thanks!')).toBe(Complexity.Quick);
    });

    it('detects demanding complexity for complex requests', () => {
      expect(detectComplexity(
        'Build a comprehensive system with multiple phases, detailed implementation steps, and complex architecture design patterns'
      )).toBe(Complexity.Demanding);
    });

    it('considers multiple questions as demanding', () => {
      expect(detectComplexity('What is X? How does Y work? Why is Z important?')).toBe(Complexity.Demanding);
    });
  });

  describe('detectTone', () => {
    it('detects casual tone', () => {
      expect(detectTone('Hey dude, whats up?')).toBe(Tone.Casual);
      expect(detectTone('lol thats cool')).toBe(Tone.Casual);
    });

    it('detects frustrated tone', () => {
      expect(detectTone('This still doesnt work! So frustrated!')).toBe(Tone.Frustrated);
      expect(detectTone('Nothing works anymore, this is terrible')).toBe(Tone.Frustrated);
    });

    it('detects urgent tone', () => {
      expect(detectTone('Need this ASAP, urgent deadline!')).toBe(Tone.Urgent);
      expect(detectTone('Please help immediately, this is critical')).toBe(Tone.Urgent);
    });

    it('detects playful tone with emojis', () => {
      expect(detectTone('This is so fun! 😄🎉')).toBe(Tone.Playful);
    });

    it('detects curious tone', () => {
      expect(detectTone('I wonder how this works? Im curious to learn more')).toBe(Tone.Curious);
    });
  });

  describe('extractPromptKeywords', () => {
    it('extracts meaningful keywords from text', () => {
      const keywords = extractPromptKeywords('Build a JavaScript function that sorts arrays');
      expect(keywords).toContain('javascript');
      expect(keywords).toContain('function');
      expect(keywords).toContain('sorts');
      expect(keywords).toContain('arrays');
    });

    it('excludes stop words', () => {
      const keywords = extractPromptKeywords('I want to build a web application');
      expect(keywords).not.toContain('i');
      expect(keywords).not.toContain('to');
      expect(keywords).not.toContain('a');
    });

    it('limits keywords to max 10', () => {
      const longText = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12';
      const keywords = extractPromptKeywords(longText);
      expect(keywords.length).toBeLessThanOrEqual(10);
    });
  });

  describe('parseModality', () => {
    it('parses text modality', () => {
      expect(parseModality('text')).toBe(Modality.Text);
      expect(parseModality('TEXT')).toBe(Modality.Text);
    });

    it('parses image modality', () => {
      expect(parseModality('image')).toBe(Modality.Image);
    });

    it('parses voice modality', () => {
      expect(parseModality('voice')).toBe(Modality.Voice);
    });

    it('parses combined modalities', () => {
      expect(parseModality('text+image')).toBe(Modality.TextImage);
      expect(parseModality('text+voice')).toBe(Modality.TextVoice);
    });

    it('defaults to text for unknown modalities', () => {
      expect(parseModality('unknown')).toBe(Modality.Text);
    });
  });

  describe('detectWebSearchRequired', () => {
    // === Prompts that SHOULD trigger web search ===

    it('detects web search for explicit search phrases', () => {
      expect(detectWebSearchRequired('Search the web for best restaurants in NYC')).toBe(true);
      expect(detectWebSearchRequired('Google it for me please')).toBe(true);
      expect(detectWebSearchRequired('Look it up online')).toBe(true);
      expect(detectWebSearchRequired('Find me the latest iPhone specs')).toBe(true);
      expect(detectWebSearchRequired('Check online for flight prices')).toBe(true);
    });

    it('detects web search for news and current events', () => {
      expect(detectWebSearchRequired('What are the latest news about AI?')).toBe(true);
      expect(detectWebSearchRequired('Breaking news today')).toBe(true);
      expect(detectWebSearchRequired('What happened with the election results?')).toBe(true);
      expect(detectWebSearchRequired('Any recent developments in climate policy?')).toBe(true);
    });

    it('detects web search for weather queries', () => {
      expect(detectWebSearchRequired('What is the weather in London today?')).toBe(true);
      expect(detectWebSearchRequired('Will it rain tomorrow in Seattle?')).toBe(true);
      expect(detectWebSearchRequired('Weather forecast for this week')).toBe(true);
      expect(detectWebSearchRequired('Temperature in Tokyo right now')).toBe(true);
    });

    it('detects web search for stock and financial data', () => {
      expect(detectWebSearchRequired('What is the stock price of Apple?')).toBe(true);
      expect(detectWebSearchRequired('Current Bitcoin price')).toBe(true);
      expect(detectWebSearchRequired('How much does Tesla stock cost today?')).toBe(true);
      expect(detectWebSearchRequired('Exchange rate USD to EUR')).toBe(true);
      expect(detectWebSearchRequired('Nasdaq index today')).toBe(true);
    });

    it('detects web search for sports scores', () => {
      expect(detectWebSearchRequired('Who won the NBA game last night?')).toBe(true);
      expect(detectWebSearchRequired('Current NFL standings')).toBe(true);
      expect(detectWebSearchRequired('Premier League scores today')).toBe(true);
      expect(detectWebSearchRequired('What is the score of the Lakers game?')).toBe(true);
    });

    it('detects web search for product releases and availability', () => {
      expect(detectWebSearchRequired('When does the new iPhone come out?')).toBe(true);
      expect(detectWebSearchRequired('Has the PlayStation 6 been released yet?')).toBe(true);
      expect(detectWebSearchRequired('Latest version of React')).toBe(true);
      expect(detectWebSearchRequired('Is the new MacBook available now?')).toBe(true);
    });

    it('detects web search for current state questions', () => {
      expect(detectWebSearchRequired('Who is the current CEO of Google?')).toBe(true);
      expect(detectWebSearchRequired('Is Twitter still free?')).toBe(true);
      expect(detectWebSearchRequired('Does Netflix still offer a free trial?')).toBe(true);
      expect(detectWebSearchRequired('What is the current population of Japan?')).toBe(true);
    });

    it('detects web search for pricing and availability', () => {
      expect(detectWebSearchRequired('How much does a Tesla Model 3 cost?')).toBe(true);
      expect(detectWebSearchRequired('Where can I buy the new AirPods?')).toBe(true);
      expect(detectWebSearchRequired('Best price for a PS5 near me')).toBe(true);
    });

    it('detects web search for trending and social media', () => {
      expect(detectWebSearchRequired('What is trending on Twitter right now?')).toBe(true);
      expect(detectWebSearchRequired('Viral TikTok videos today')).toBe(true);
    });

    it('detects web search for temporal keywords', () => {
      expect(detectWebSearchRequired('What are the latest trends in AI this year?')).toBe(true);
      expect(detectWebSearchRequired('News from this week about space exploration')).toBe(true);
    });

    it('detects web search for service status checks', () => {
      expect(detectWebSearchRequired('Is GitHub down right now?')).toBe(true);
      expect(detectWebSearchRequired('Server status of AWS')).toBe(true);
    });

    it('detects web search with research intent and temporal signal', () => {
      expect(detectWebSearchRequired('Find the latest research papers on quantum computing', Intent.Research)).toBe(true);
    });

    it('detects web search for domain-based queries (weather)', () => {
      expect(detectWebSearchRequired('Tell me the conditions outside', undefined, 'weather' as Domain)).toBe(true);
    });

    it('detects web search for domain-based queries (sports)', () => {
      expect(detectWebSearchRequired('What are the scores?', undefined, 'sports' as Domain)).toBe(true);
    });

    // === Prompts that should NOT trigger web search ===

    it('does not trigger web search for coding tasks', () => {
      expect(detectWebSearchRequired('Write a function to sort an array')).toBe(false);
      expect(detectWebSearchRequired('Debug this Python code')).toBe(false);
      expect(detectWebSearchRequired('Implement a binary search tree')).toBe(false);
    });

    it('does not trigger web search for creative writing', () => {
      expect(detectWebSearchRequired('Write me a poem about the ocean')).toBe(false);
      expect(detectWebSearchRequired('Tell me a story about dragons')).toBe(false);
    });

    it('does not trigger web search for general knowledge questions', () => {
      expect(detectWebSearchRequired('What is photosynthesis?')).toBe(false);
      expect(detectWebSearchRequired('Explain the theory of relativity')).toBe(false);
      expect(detectWebSearchRequired('How does DNA replication work?')).toBe(false);
    });

    it('does not trigger web search for math problems', () => {
      expect(detectWebSearchRequired('Solve the equation 2x + 5 = 15')).toBe(false);
      expect(detectWebSearchRequired('Calculate the integral of sin(x)')).toBe(false);
    });

    it('does not trigger web search for conversational prompts', () => {
      expect(detectWebSearchRequired('Hello, how are you?')).toBe(false);
      expect(detectWebSearchRequired('Thanks for helping me!')).toBe(false);
    });

    it('does not trigger web search for translation tasks', () => {
      expect(detectWebSearchRequired('Translate this to French: Hello world')).toBe(false);
    });

    it('does not trigger web search for summarization tasks', () => {
      expect(detectWebSearchRequired('Summarize this paragraph for me')).toBe(false);
    });

    it('does not trigger web search for analysis tasks', () => {
      expect(detectWebSearchRequired('Analyze the themes in Hamlet')).toBe(false);
      expect(detectWebSearchRequired('Compare object-oriented and functional programming')).toBe(false);
    });
  });

  describe('analyze', () => {
    it('returns complete analysis for a prompt', () => {
      const result = analyze('Write a Python function to sort data', Modality.Text);

      expect(result.intent).toBe(Intent.Coding);
      expect(result.modality).toBe(Modality.Text);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.humanContextUsed).toBe(false);
      expect(result.webSearchRequired).toBe(false);
    });

    it('indicates human context usage when provided', () => {
      const result = analyze('Help me relax', Modality.Text, {
        emotionalState: { mood: 'stressed' as const },
      });

      expect(result.humanContextUsed).toBe(true);
    });

    it('handles string modality input', () => {
      const result = analyze('Test prompt', 'text');
      expect(result.modality).toBe(Modality.Text);
    });

    it('sets webSearchRequired true for news queries', () => {
      const result = analyze('What are the latest news about AI?', Modality.Text);
      expect(result.webSearchRequired).toBe(true);
    });

    it('sets webSearchRequired false for coding tasks', () => {
      const result = analyze('Write a function to sort an array', Modality.Text);
      expect(result.webSearchRequired).toBe(false);
    });
  });
});
