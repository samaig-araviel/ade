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

// Detect primary intent from prompt
export function detectIntent(prompt: string): Intent {
  const tokens = new Set(tokenize(prompt));
  let bestIntent = Intent.Conversation;
  let bestScore = 0;

  for (const [intent, keywords] of INTENT_KEYWORDS) {
    const score = countMatches(tokens, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // Default to conversation if no strong signal
  if (bestScore === 0) {
    // Check if it's a question
    const lowerPrompt = prompt.toLowerCase();
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

// Detect domain from prompt
export function detectDomain(prompt: string): Domain {
  const tokens = new Set(tokenize(prompt));
  let bestDomain = Domain.General;
  let bestScore = 0;

  for (const [domain, keywords] of DOMAIN_KEYWORDS) {
    const score = countMatches(tokens, keywords);
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
