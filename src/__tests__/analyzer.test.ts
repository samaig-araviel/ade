import {
  detectIntent,
  detectDomain,
  detectComplexity,
  detectTone,
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

  describe('analyze', () => {
    it('returns complete analysis for a prompt', () => {
      const result = analyze('Write a Python function to sort data', Modality.Text);

      expect(result.intent).toBe(Intent.Coding);
      expect(result.modality).toBe(Modality.Text);
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.humanContextUsed).toBe(false);
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
  });
});
