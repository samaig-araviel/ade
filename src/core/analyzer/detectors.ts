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

// ========== GENERATION DETECTION PATTERNS ==========

// Image generation patterns - "generate an image", "create a picture", "draw me a..."
const IMAGE_GENERATION_PATTERNS = [
  /\b(generate|create|make|draw|design|paint|render|produce)\s+(me\s+)?(an?\s+)?(image|picture|photo|photograph|illustration|artwork|poster|logo|icon|banner|thumbnail|avatar|wallpaper|infographic|mockup|wireframe|portrait|landscape|cityscape|seascape|skyline)\b/i,
  /\b(draw|paint|sketch)\s+me\s+(an?\s+)?/i,  // "draw me a cityscape" - "me" disambiguates from "draw a conclusion"
  /\b(image|picture|photo|illustration|artwork|poster|logo|icon)\s+of\b/i,
  /\bdalle?\b/i,
  /\bmidjourney\b/i,
  /\bstable\s+diffusion\b/i,
  /\btext[\s-]to[\s-]image\b/i,
  /\bai[\s-]generated?\s+(image|art|picture)\b/i,
];

// Video generation patterns
const VIDEO_GENERATION_PATTERNS = [
  /\b(generate|create|make|produce|render)\s+(an?\s+)?(video|clip|animation|movie|film|footage|trailer)\b/i,
  /\btext[\s-]to[\s-]video\b/i,
  /\banimate\s+(this|that|the|a|an|my)\b/i,
  /\b(sora|veo|runway|pika)\b/i,
];

// Voice/TTS generation patterns
const VOICE_GENERATION_PATTERNS = [
  /\b(convert|turn|transform)\s+.{0,30}(to\s+)?(speech|audio|voice)\b/i,
  /\bread\s+(this\s+)?(aloud|out\s*loud)\b/i,
  /\btext[\s-]to[\s-]speech\b/i,
  /\b(generate|create|make|produce)\s+(a\s+)?(voice|voiceover|narration|audio)\b/i,
  /\bnarrate\s+(this|the|my)\b/i,
  /\belevenlabs?\b/i,
  /\bclone\s+(my\s+)?voice\b/i,
  /\btts\b/i,
];

// Music generation patterns
const MUSIC_GENERATION_PATTERNS = [
  /\b(generate|create|make|produce|compose)\s+(a\s+)?(song|beat|track|melody|music|jingle|soundtrack|instrumental)\b/i,
  /\btext[\s-]to[\s-]music\b/i,
  /\b(suno|udio)\b/i,
  /\bai[\s-]music\b/i,
];

// Research patterns (distinct from factual - implies depth and recency)
const RESEARCH_PATTERNS = [
  /\bresearch\s+(the\s+)?(latest|recent|current|new|newest)\b/i,
  /\b(find|look\s+up|search\s+for)\s+.{0,30}(studies|papers|articles|publications|research)\b/i,
  /\bliterature\s+review\b/i,
  /\bstate\s+of\s+the\s+art\b/i,
  /\bcutting[\s-]edge\b/i,
  /\bwhat\s+(are|is)\s+the\s+(latest|newest|most\s+recent)\b/i,
  /\bdeep\s+dive\b/i,
];

// Math/calculation patterns
const MATH_PATTERNS = [
  /\b(solve|calculate|compute|evaluate)\s+(the\s+|this\s+)?(equation|expression|integral|derivative|formula|problem)\b/i,
  /\bwhat\s+is\s+\d+\s*[\+\-\*\/\^]\s*\d+/i,
  /\b\d+\s*[\+\-\*\/\^]\s*\d+\s*=\s*\?/i,
  /\bprove\s+(that|this)\b/i,
  /\bfind\s+the\s+(value|root|solution|derivative|integral|limit|eigenvalue|eigenvalues)\b/i,
];

// Planning patterns
const PLANNING_PATTERNS = [
  /\bplan\s+(a|my|the|our)\s+(trip|vacation|wedding|party|event|schedule|day|week|month)\b/i,
  /\bcreate\s+(a\s+)?(schedule|itinerary|timeline|roadmap|plan)\b/i,
  /\borganize\s+(a|my|the|our)\b/i,
  /\bhelp\s+me\s+(plan|organize|schedule|prepare)\b/i,
];

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
  /\bwrite\s+(a\s+)?script\s+that\b/i,
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

// ========== PATTERN MATCHING HELPERS ==========

function matchesPatterns(prompt: string, patterns: RegExp[]): boolean {
  for (const pattern of patterns) {
    if (pattern.test(prompt)) {
      return true;
    }
  }
  return false;
}

function hasCreativeWritingPattern(prompt: string): boolean {
  if (matchesPatterns(prompt, TECH_CODE_PATTERNS)) {
    return false;
  }
  return matchesPatterns(prompt, CREATIVE_WRITING_PATTERNS);
}

// ========== INTENT DETECTION ==========

export function detectIntent(prompt: string): Intent {
  const tokens = new Set(tokenize(prompt));
  const lowerPrompt = prompt.toLowerCase();

  // PRIORITY 1: Generation intents (strongest pattern match - these are unambiguous)
  if (matchesPatterns(prompt, IMAGE_GENERATION_PATTERNS)) {
    return Intent.ImageGeneration;
  }
  if (matchesPatterns(prompt, VIDEO_GENERATION_PATTERNS)) {
    return Intent.VideoGeneration;
  }
  if (matchesPatterns(prompt, VOICE_GENERATION_PATTERNS)) {
    return Intent.VoiceGeneration;
  }
  if (matchesPatterns(prompt, MUSIC_GENERATION_PATTERNS)) {
    return Intent.MusicGeneration;
  }

  // PRIORITY 2: Strong pattern matches for other specific intents
  if (matchesPatterns(prompt, MATH_PATTERNS)) {
    return Intent.Math;
  }
  if (matchesPatterns(prompt, RESEARCH_PATTERNS)) {
    return Intent.Research;
  }
  if (matchesPatterns(prompt, PLANNING_PATTERNS)) {
    return Intent.Planning;
  }

  // PRIORITY 3: Creative writing patterns
  if (hasCreativeWritingPattern(prompt)) {
    return Intent.Creative;
  }

  // PRIORITY 4: Keyword-based scoring
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
      intentScores.set(Intent.Creative, creativeScore + 5);
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

  // Penalize generation intents that didn't match patterns (prevents false positives from keyword overlap)
  const generationIntents = [Intent.ImageGeneration, Intent.VideoGeneration, Intent.VoiceGeneration, Intent.MusicGeneration];
  for (const genIntent of generationIntents) {
    const genScore = intentScores.get(genIntent) ?? 0;
    intentScores.set(genIntent, Math.max(0, genScore - 3));
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

  // Check for greeting/conversation patterns (short casual messages)
  const greetingPatterns = /^(hey|hi|hello|howdy|good\s+(morning|afternoon|evening|night)|greetings|yo|sup|what'?s\s+up)/i;
  if (greetingPatterns.test(prompt.trim()) && tokenize(prompt).length < 8) {
    // Short messages starting with greetings are conversational
    return Intent.Conversation;
  }

  // Default to conversation if no strong signal
  if (bestScore === 0) {
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

// ========== DOMAIN DETECTION ==========

export function detectDomain(prompt: string, detectedIntent?: Intent): Domain {
  const tokens = new Set(tokenize(prompt));

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

    const onlyAIorRobot = tokens.has('ai') || tokens.has('robot') || tokens.has('android');
    const hasManyTechWords = (domainScores.get(Domain.Technology) ?? 0) > 2;

    if (onlyAIorRobot && !hasManyTechWords) {
      domainScores.set(Domain.Technology, 0);
    }
  }

  // Boost Creative Arts for generation intents
  if (detectedIntent === Intent.ImageGeneration || detectedIntent === Intent.VideoGeneration ||
      detectedIntent === Intent.MusicGeneration) {
    const currentCreativeArts = domainScores.get(Domain.CreativeArts) ?? 0;
    domainScores.set(Domain.CreativeArts, currentCreativeArts + 8);
  }

  // Boost relevant domains for specific intents
  if (detectedIntent === Intent.Planning) {
    const current = domainScores.get(Domain.EventPlanning) ?? 0;
    domainScores.set(Domain.EventPlanning, current + 5);
  }

  if (detectedIntent === Intent.Research) {
    const currentScience = domainScores.get(Domain.Science) ?? 0;
    const currentEdu = domainScores.get(Domain.Education) ?? 0;
    // Boost science and education slightly for research
    domainScores.set(Domain.Science, currentScience + 2);
    domainScores.set(Domain.Education, currentEdu + 2);
  }

  // Check for creative arts contextual patterns
  if (hasCreativeWritingPattern(prompt)) {
    const currentCreativeArts = domainScores.get(Domain.CreativeArts) ?? 0;
    domainScores.set(Domain.CreativeArts, currentCreativeArts + 8);
  }

  // Creative content keywords
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

// ========== COMPLEXITY DETECTION ==========

export function detectComplexity(prompt: string): Complexity {
  const tokens = new Set(tokenize(prompt));
  const lowerPrompt = prompt.toLowerCase();

  const simpleCount = countMatches(tokens, COMPLEXITY_SIMPLE_INDICATORS);
  const demandingCount = countMatches(tokens, COMPLEXITY_DEMANDING_INDICATORS);

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

// ========== TONE DETECTION ==========

export function detectTone(prompt: string): Tone {
  const tokens = new Set(tokenize(prompt));
  const lowerPrompt = prompt.toLowerCase();

  const toneScores = new Map<Tone, number>();

  for (const [tone, indicators] of TONE_INDICATORS) {
    const score = countMatches(tokens, indicators);
    toneScores.set(tone, score);
  }

  // Frustration signals
  if (lowerPrompt.includes('!!!') || lowerPrompt.includes('???') ||
      lowerPrompt === lowerPrompt.toUpperCase() && prompt.length > 20) {
    toneScores.set(Tone.Frustrated, (toneScores.get(Tone.Frustrated) ?? 0) + 3);
  }

  // Urgency signals
  if (lowerPrompt.includes('asap') || lowerPrompt.includes('urgent') ||
      lowerPrompt.includes('immediately') || lowerPrompt.includes('deadline')) {
    toneScores.set(Tone.Urgent, (toneScores.get(Tone.Urgent) ?? 0) + 3);
  }

  // Playfulness (emojis)
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

  if (bestScore === 0) {
    if (lowerPrompt.includes('please') || lowerPrompt.includes('kindly') ||
        lowerPrompt.includes('would you') || lowerPrompt.includes('could you')) {
      return Tone.Professional;
    }
    return Tone.Casual;
  }

  return bestTone;
}

// ========== UTILITIES ==========

export function extractPromptKeywords(prompt: string): string[] {
  return extractKeywords(prompt, 10);
}

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

export function isPureModality(modality: Modality): boolean {
  return modality === Modality.Image || modality === Modality.Voice;
}

export function isCombinedModality(modality: Modality): boolean {
  return modality === Modality.TextImage || modality === Modality.TextVoice;
}

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
