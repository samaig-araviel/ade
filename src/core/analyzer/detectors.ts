import { Intent, Domain, Complexity, Tone, Modality } from '@/types';
import {
  INTENT_KEYWORDS,
  DOMAIN_KEYWORDS,
  TONE_INDICATORS,
  COMPLEXITY_SIMPLE_INDICATORS,
  COMPLEXITY_DEMANDING_INDICATORS,
} from './dictionaries';
import { extractKeywords } from '@/lib/helpers';

// Tokenize text for analysis
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

// Count keyword matches for a category
function countMatches(tokens: Set<string>, keywords: Set<string>): number {
  let count = 0;
  for (const token of tokens) {
    if (keywords.has(token)) {
      count++;
    }
  }
  return count;
}

// Strong creative writing patterns that should boost creative intent
const CREATIVE_WRITING_PATTERNS = [
  /\bwrite\s+(a\s+)?(short\s+)?story\b/i,
  /\bwrite\s+(a\s+)?poem\b/i,
  /\bwrite\s+(a\s+)?novel\b/i,
  /\bwrite\s+(a\s+)?script\b/i,
  /\bwrite\s+(a\s+)?screenplay\b/i,
  /\bwrite\s+(a\s+)?song\b/i,
  /\bwrite\s+(a\s+)?lyrics\b/i,
  /\bwrite\s+(a\s+)?essay\b/i,
  /\bwrite\s+(a\s+)?blog\s+post\b/i,
  /\bwrite\s+(a\s+)?article\b/i,
  /\bcreate\s+(a\s+)?story\b/i,
  /\bcreate\s+(a\s+)?poem\b/i,
  /\bcompose\s+(a\s+)?poem\b/i,
  /\bcompose\s+(a\s+)?song\b/i,
  /\btell\s+(me\s+)?(a\s+)?story\b/i,
  /\bstory\s+about\b/i,
  /\bpoem\s+about\b/i,
  /\bfiction\s+about\b/i,
  /\bnarrative\s+about\b/i,
  /\bcreative\s+writing\b/i,
  /\bimagine\s+a\b/i,
  /\bonce\s+upon\s+a\s+time\b/i,
];

// Patterns indicating technical/coding domain that should NOT be in Creative Arts
const TECH_CODE_PATTERNS = [
  /\bwrite\s+(a\s+)?function\b/i,
  /\bwrite\s+(a\s+)?code\b/i,
  /\bwrite\s+(a\s+)?script\s+that\b/i,  // "script that" is coding, "script" alone might be creative
  /\bwrite\s+(a\s+)?program\b/i,
  /\bwrite\s+(a\s+)?class\b/i,
  /\bwrite\s+(a\s+)?test\b/i,
  /\bimplement\b/i,
  /\bdebug\b/i,
  /\bfix\s+(the\s+)?bug\b/i,
  /\brefactor\b/i,
  /\bapi\s+endpoint\b/i,
  /\bdatabase\b/i,
  /\bquery\b/i,
];

// Check if prompt matches creative writing patterns
function hasCreativeWritingPattern(prompt: string): boolean {
  // First check if it's a technical context (which overrides creative patterns)
  for (const pattern of TECH_CODE_PATTERNS) {
    if (pattern.test(prompt)) {
      return false;
    }
  }

  // Then check for creative patterns
  for (const pattern of CREATIVE_WRITING_PATTERNS) {
    if (pattern.test(prompt)) {
      return true;
    }
  }
  return false;
}

// Detect primary intent from prompt
export function detectIntent(prompt: string): Intent {
  const tokens = new Set(tokenize(prompt));
  const lowerPrompt = prompt.toLowerCase();

  // Strong pattern matching first for creative writing
  if (hasCreativeWritingPattern(prompt)) {
    return Intent.Creative;
  }

  // Calculate scores for each intent with weighted matching
  const intentScores = new Map<Intent, number>();

  for (const [intent, keywords] of INTENT_KEYWORDS) {
    const baseScore = countMatches(tokens, keywords);
    intentScores.set(intent, baseScore);
  }

  // Apply contextual boosting

  // Boost Creative if certain combinations exist
  const creativeScore = intentScores.get(Intent.Creative) ?? 0;
  if (tokens.has('write') || tokens.has('writing')) {
    if (tokens.has('story') || tokens.has('poem') || tokens.has('fiction') ||
        tokens.has('novel') || tokens.has('narrative') || tokens.has('creative') ||
        tokens.has('song') || tokens.has('lyrics') || tokens.has('screenplay')) {
      intentScores.set(Intent.Creative, creativeScore + 5); // Strong boost
    }
  }

  // Boost Creative for certain contextual keywords
  if (tokens.has('imagine') || tokens.has('fantasy') || tokens.has('fictional') ||
      tokens.has('character') || tokens.has('plot')) {
    intentScores.set(Intent.Creative, (intentScores.get(Intent.Creative) ?? 0) + 3);
  }

  // Penalize Coding intent if there are no actual coding keywords present
  const hasCodingContext = tokens.has('code') || tokens.has('function') ||
    tokens.has('programming') || tokens.has('debug') || tokens.has('api') ||
    tokens.has('database') || tokens.has('algorithm') || tokens.has('implement');

  if (!hasCodingContext) {
    const codingScore = intentScores.get(Intent.Coding) ?? 0;
    intentScores.set(Intent.Coding, Math.max(0, codingScore - 2));
  }

  // Find best intent
  let bestIntent = Intent.Conversation;
  let bestScore = 0;

  for (const [intent, score] of intentScores) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // Default to conversation if no strong signal
  if (bestScore === 0) {
    // Check if it's a question
    if (lowerPrompt.includes('?') ||
        lowerPrompt.startsWith('what') ||
        lowerPrompt.startsWith('how') ||
        lowerPrompt.startsWith('why') ||
        lowerPrompt.startsWith('when') ||
        lowerPrompt.startsWith('where') ||
        lowerPrompt.startsWith('who')) {
      return Intent.Factual;
    }
  }

  return bestIntent;
}

// Detect domain from prompt with intent-aware context
export function detectDomain(prompt: string, detectedIntent?: Intent): Domain {
  const tokens = new Set(tokenize(prompt));
  const lowerPrompt = prompt.toLowerCase();

  // Calculate base scores for each domain
  const domainScores = new Map<Domain, number>();

  for (const [domain, keywords] of DOMAIN_KEYWORDS) {
    const baseScore = countMatches(tokens, keywords);
    domainScores.set(domain, baseScore);
  }

  // If intent is Creative, heavily boost Creative Arts domain
  if (detectedIntent === Intent.Creative) {
    const currentCreativeArts = domainScores.get(Domain.CreativeArts) ?? 0;
    domainScores.set(Domain.CreativeArts, currentCreativeArts + 10);

    // Also reduce Technology score if the only tech word is "AI" or "robot" in creative context
    const onlyAIorRobot = tokens.has('ai') || tokens.has('robot') || tokens.has('android');
    const hasManyTechWords = (domainScores.get(Domain.Technology) ?? 0) > 2;

    if (onlyAIorRobot && !hasManyTechWords) {
      // "AI discovers friendship" is creative writing about AI, not tech writing
      domainScores.set(Domain.Technology, 0);
    }
  }

  // Check for creative arts contextual patterns
  if (hasCreativeWritingPattern(prompt)) {
    const currentCreativeArts = domainScores.get(Domain.CreativeArts) ?? 0;
    domainScores.set(Domain.CreativeArts, currentCreativeArts + 8);
  }

  // Creative content keywords that indicate Creative Arts
  const creativeContextWords = ['story', 'poem', 'song', 'narrative', 'character',
    'plot', 'fiction', 'novel', 'screenplay', 'lyrics', 'verse', 'chapter',
    'protagonist', 'antagonist', 'theme', 'metaphor', 'imagery'];

  for (const word of creativeContextWords) {
    if (tokens.has(word)) {
      const current = domainScores.get(Domain.CreativeArts) ?? 0;
      domainScores.set(Domain.CreativeArts, current + 2);
    }
  }

  // Emotional/abstract concepts in stories boost Creative Arts
  const emotionalConcepts = ['love', 'friendship', 'betrayal', 'hope', 'fear',
    'courage', 'adventure', 'mystery', 'discovery', 'meaning', 'journey'];

  for (const concept of emotionalConcepts) {
    if (tokens.has(concept)) {
      const current = domainScores.get(Domain.CreativeArts) ?? 0;
      domainScores.set(Domain.CreativeArts, current + 1);
    }
  }

  // Find best domain
  let bestDomain = Domain.General;
  let bestScore = 0;

  for (const [domain, score] of domainScores) {
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }

  return bestDomain;
}

// Detect complexity from prompt
export function detectComplexity(prompt: string): Complexity {
  const tokens = new Set(tokenize(prompt));
  const lowerPrompt = prompt.toLowerCase();

  // Count simple and demanding indicators
  const simpleCount = countMatches(tokens, COMPLEXITY_SIMPLE_INDICATORS);
  const demandingCount = countMatches(tokens, COMPLEXITY_DEMANDING_INDICATORS);

  // Factor in prompt length
  const wordCount = tokenize(prompt).length;

  // Very short prompts are likely simple
  if (wordCount < 10 && demandingCount === 0) {
    return Complexity.Quick;
  }

  // Long prompts with demanding indicators are demanding
  if (wordCount > 50 && demandingCount >= 2) {
    return Complexity.Demanding;
  }

  // Check for multiple questions or requests
  const questionCount = (lowerPrompt.match(/\?/g) || []).length;
  const andCount = (lowerPrompt.match(/\band\b/g) || []).length;
  const alsoCount = (lowerPrompt.match(/\balso\b/g) || []).length;

  if (questionCount >= 3 || (andCount + alsoCount) >= 3) {
    return Complexity.Demanding;
  }

  // Calculate scores
  const simpleScore = simpleCount * 2 + (wordCount < 20 ? 2 : 0);
  const demandingScore = demandingCount * 2 + (wordCount > 100 ? 2 : 0) +
                         questionCount + andCount + alsoCount;

  if (demandingScore > simpleScore + 2) {
    return Complexity.Demanding;
  } else if (simpleScore > demandingScore + 2) {
    return Complexity.Quick;
  }

  return Complexity.Standard;
}

// Detect tone from prompt
export function detectTone(prompt: string): Tone {
  const tokens = new Set(tokenize(prompt));
  const lowerPrompt = prompt.toLowerCase();

  // Check each tone
  const toneScores = new Map<Tone, number>();

  for (const [tone, indicators] of TONE_INDICATORS) {
    const score = countMatches(tokens, indicators);
    toneScores.set(tone, score);
  }

  // Additional heuristics

  // Check for frustration signals
  if (lowerPrompt.includes('!!!') || lowerPrompt.includes('???') ||
      lowerPrompt === lowerPrompt.toUpperCase() && prompt.length > 20) {
    toneScores.set(Tone.Frustrated, (toneScores.get(Tone.Frustrated) ?? 0) + 3);
  }

  // Check for urgency signals
  if (lowerPrompt.includes('asap') || lowerPrompt.includes('urgent') ||
      lowerPrompt.includes('immediately') || lowerPrompt.includes('deadline')) {
    toneScores.set(Tone.Urgent, (toneScores.get(Tone.Urgent) ?? 0) + 3);
  }

  // Check for playfulness (emojis)
  const emojiCount = (prompt.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu) || []).length;
  if (emojiCount > 0) {
    toneScores.set(Tone.Playful, (toneScores.get(Tone.Playful) ?? 0) + emojiCount);
  }

  // Find best tone
  let bestTone = Tone.Casual;
  let bestScore = 0;

  for (const [tone, score] of toneScores) {
    if (score > bestScore) {
      bestScore = score;
      bestTone = tone;
    }
  }

  // Default to casual if no strong signal
  if (bestScore === 0) {
    // Check for formality indicators
    if (lowerPrompt.includes('please') || lowerPrompt.includes('kindly') ||
        lowerPrompt.includes('would you') || lowerPrompt.includes('could you')) {
      return Tone.Professional;
    }
    return Tone.Casual;
  }

  return bestTone;
}

// Extract significant keywords from prompt
export function extractPromptKeywords(prompt: string): string[] {
  return extractKeywords(prompt, 10);
}

// Parse and validate modality from request
export function parseModality(modalityStr: string): Modality {
  const normalized = modalityStr.toLowerCase().trim();

  switch (normalized) {
    case 'text':
      return Modality.Text;
    case 'image':
      return Modality.Image;
    case 'voice':
      return Modality.Voice;
    case 'text+image':
    case 'textimage':
    case 'text_image':
      return Modality.TextImage;
    case 'text+voice':
    case 'textvoice':
    case 'text_voice':
      return Modality.TextVoice;
    default:
      return Modality.Text;
  }
}

// Check if modality is pure (non-text)
export function isPureModality(modality: Modality): boolean {
  return modality === Modality.Image || modality === Modality.Voice;
}

// Check if modality is combined
export function isCombinedModality(modality: Modality): boolean {
  return modality === Modality.TextImage || modality === Modality.TextVoice;
}

// Get modality type for scoring
export function getModalityType(modality: Modality): 'text' | 'vision' | 'audio' {
  switch (modality) {
    case Modality.Image:
    case Modality.TextImage:
      return 'vision';
    case Modality.Voice:
    case Modality.TextVoice:
      return 'audio';
    default:
      return 'text';
  }
}
