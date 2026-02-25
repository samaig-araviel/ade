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

// ========== WEB SEARCH DETECTION ==========

// Temporal keywords indicating need for current/real-time information
const TEMPORAL_KEYWORDS = new Set([
  // Direct temporal references
  'today', 'tonight', 'tomorrow', 'yesterday', 'currently', 'current',
  'latest', 'recent', 'recently', 'newest', 'updated',
  // Recency modifiers
  'breaking', 'trending', 'emerging', 'upcoming', 'ongoing', 'developing',
  'live', 'realtime', 'fresh',
  // Year references (2024-2027)
  '2024', '2025', '2026', '2027',
]);

// Multi-word temporal phrases (checked against lowered prompt)
const TEMPORAL_PHRASES: string[] = [
  'this week', 'this month', 'this year', 'this quarter', 'this season',
  'last week', 'last month', 'last year', 'last quarter', 'last night',
  'past week', 'past month', 'past year', 'past hour', 'past day',
  'right now', 'just now', 'moments ago',
  'real-time', 'real time', 'up-to-date', 'up to date',
  'as of today', 'as of now', 'at the moment',
  'most recent', 'most up-to-date',
];

// News, events, and real-time data patterns
const REALTIME_DATA_PATTERNS: RegExp[] = [
  // News and events
  /\b(latest|recent|current|breaking|trending)\s+(news|headlines|updates|developments|events|stories|reports)\b/i,
  /\bnews\s+(about|on|regarding|from|in)\b/i,
  /\bwhat\s+(is|are)\s+(happening|going\s+on|new)\b/i,
  /\bwhat\s+happened\s+(to|with|in|at|today|yesterday|recently)\b/i,
  /\bany\s+(new|recent|latest)\s+(news|updates|developments|announcements)\b/i,

  // Sports scores and results
  /\b(score|scores|result|results)\s+(of|for|from)\s+(the|today|yesterday|last\s+night)\b/i,
  /\bwho\s+(won|lost|scored|is\s+winning|is\s+leading)\b/i,
  /\b(game|match|fight|race)\s+(score|result|outcome)\b/i,
  /\b(nba|nfl|mlb|nhl|fifa|premier\s+league|champions\s+league|world\s+cup|la\s+liga|serie\s+a|bundesliga|ligue\s+1|ipl|afl|mls)\s+(scores?|results?|standings?|schedule|table|fixtures?)\b/i,
  /\bcurrent\s+(standings|rankings|leaderboard|stats|statistics|table|form)\b/i,
  /\b(playoff|finals|semi.?final|quarter.?final)\s+(schedule|bracket|results?|scores?)\b/i,
  /\btransfer\s+(news|rumors?|rumours?|window|deadline|signings?)\b/i,

  // Weather
  /\bweather\s+(in|for|at|today|tomorrow|this\s+week|forecast|conditions?|outlook)\b/i,
  /\b(will\s+it|is\s+it\s+going\s+to)\s+(rain|snow|storm|hail|be\s+(hot|cold|warm|sunny|cloudy|humid|windy))\b/i,
  /\bforecast\s+(for|in|today|tomorrow|this\s+week|weekend|next\s+week)\b/i,
  /\btemperature\s+(in|at|today|right\s+now|current|outside)\b/i,
  /\b(uv|air\s+quality|pollen|humidity)\s+(index|level|today|current|forecast)\b/i,

  // Stock market and financial data
  /\b(stock|share|equity)\s+(price|value|market|ticker|quote)\b/i,
  /\b(price|value|cost|rate)\s+of\s+(bitcoin|btc|ethereum|eth|gold|silver|oil|gas|crypto|bnb|xrp|ada|doge|sol)\b/i,
  /\b(market|stock|trading|crypto)\s+(today|now|current|update|open|close|hours)\b/i,
  /\bhow\s+much\s+(is|does|are|do|did)\b/i,
  /\b(exchange\s+rate|forex|currency\s+(rate|conversion|exchange))\b/i,
  /\b(dow|nasdaq|s&p|ftse|nikkei|hang\s+seng|dax|cac|sensex|nifty|kospi|asx)\s*(500|100|200|30)?\s*(index|today|now|current)?\b/i,
  /\b(interest\s+rate|fed\s+(rate|funds)|inflation\s+rate|cpi|ppi)\s*(today|current|now|latest)?\b/i,
  /\b(earnings|quarterly\s+results?|annual\s+report|revenue)\s+(for|of|from)\b/i,
  /\b(ipo|earnings\s+call|dividend)\s+(date|schedule|announcement|today)\b/i,

  // Elections and politics
  /\b(election|poll|polling|vote|ballot|referendum|primary|caucus)\s+(results?|updates?|latest|current|2024|2025|2026|predictions?|forecast)\b/i,
  /\bwho\s+is\s+(winning|leading|ahead)\s+(in\s+the)?\s*(polls?|election|race|primary)\b/i,
  /\b(president|prime\s+minister|governor|mayor|chancellor|premier)\s+of\b/i,
  /\b(cabinet|government)\s+(reshuffle|formation|ministers?)\b/i,
  /\b(sanctions?|tariffs?|trade\s+war|embargo)\s+(on|against|latest|new|current)\b/i,

  // Product releases, launches, availability
  /\b(release|released|launch|launched|announced|available|unveiled|revealed|dropped|out\s+now)\b/i,
  /\bwhen\s+(does|will|is|did)\s+.{0,50}\s+(come\s+out|release|launch|drop|ship|available|premiere)\b/i,
  /\b(new|latest|upcoming|next)\s+(release|version|model|update|feature|product|generation|lineup)\b/i,
  /\bis\s+.{0,30}\s+(out|released|available|launched|shipping)\s*(yet|now|already)?\b/i,
  /\b(pre.?order|waitlist|wait\s+list|sign\s+up|early\s+access)\s+(for|open|available|live)\b/i,

  // Company and organization current state
  /\b(ceo|cto|cfo|coo|cmo|president|chairman|founder|owner|director)\s+of\b/i,
  /\bwho\s+(runs|leads|owns|founded|heads|manages)\b/i,
  /\bhow\s+many\s+(employees|users|subscribers|members|customers|stores|locations)\s+(does|do|are\s+there)\b/i,
  /\b(market\s+cap(italization)?|valuation|net\s+worth)\s+(of|for)\b/i,
  /\b(revenue|profit|income|funding|series\s+[a-f])\s+(of|for|at)\b/i,
  /\b(acquired|merger|acquisition|buyout|takeover)\s+(of|by|between)\b/i,
  /\b(layoffs?|hiring\s+freeze|restructuring|bankruptcy|shutdown)\s+(at|of|by)\b/i,

  // Travel and logistics
  /\bflight\s+(status|delay|cancellation|schedule|to|from|tracker)\b/i,
  /\b(traffic|road\s+conditions?|travel\s+advisory|travel\s+ban|visa\s+requirements?|entry\s+requirements?)\b/i,
  /\b(open|closed|operating\s+hours|business\s+hours|opening\s+hours|schedule)\s+(right\s+now|today|currently|on\s+sunday|on\s+monday)\b/i,
  /\b(gas|petrol|diesel|fuel)\s+(price|cost|station)\s*(near|in|at|today|current)?\b/i,
  /\b(airport|train|bus)\s+(schedule|delay|status|arrivals?|departures?)\b/i,
  /\b(uber|lyft|taxi)\s+(price|cost|fare|surge|availability)\b/i,

  // Tech and product info
  /\b(specs?|specifications?|features?|pricing|price|benchmarks?)\s+(of|for)\s+(the\s+)?(new|latest|upcoming|iphone|samsung|pixel|macbook|ipad|surface|galaxy)\b/i,
  /\b(iphone|samsung|pixel|playstation|xbox|nvidia|amd|intel|apple|tesla|rivian)\s+\d+/i,
  /\b(ios|android|windows|macos|chrome\s*os|linux)\s+\d+/i,
  /\b(benchmark|geekbench|cinebench|3dmark|antutu)\s*(scores?|results?|comparison)\b/i,
  /\b(software|app|firmware)\s+(update|version|patch|changelog|release\s+notes)\b/i,

  // Entertainment and media
  /\b(box\s+office|ratings?|viewership|reviews?|rotten\s+tomatoes|imdb|metacritic)\s+(for|of|this\s+week|today|latest|new)\b/i,
  /\b(now\s+playing|currently\s+showing|streaming\s+on|available\s+on|coming\s+to)\b/i,
  /\b(trailer|teaser)\s+(for|of)\s+(the\s+)?(new|latest|upcoming)\b/i,
  /\b(netflix|hulu|disney|hbo|amazon\s+prime|apple\s+tv|peacock|paramount)\s+(new|releases?|shows?|movies?|originals?)\b/i,
  /\b(billboard|spotify|apple\s+music)\s+(chart|top|hot|playlist|trending)\b/i,

  // Health and pandemic data
  /\b(covid|coronavirus|pandemic|outbreak|epidemic|flu\s+season|bird\s+flu|mpox)\s+(cases?|deaths?|stats?|data|numbers?|update|current|today|wave)\b/i,
  /\b(vaccine|vaccination)\s+(availability|schedule|rollout|update|booster|side\s+effects?|recall)\b/i,
  /\b(fda|ema|who|cdc)\s+(approval|approved|authorized|warning|recall|advisory|guidelines?)\b/i,
  /\b(drug|medication)\s+(recall|shortage|approval|interaction|price)\b/i,

  // Legal and regulatory
  /\b(new|latest|recent|updated|proposed)\s+(law|regulation|policy|legislation|ruling|ban|sanction|directive|mandate)\b/i,
  /\b(supreme\s+court|court|tribunal|judge|jury)\s+(ruling|decision|case|hearing|verdict|opinion)\b/i,
  /\b(gdpr|ccpa|hipaa|sec|ftc|doj)\s+(ruling|fine|action|investigation|update|enforcement)\b/i,
  /\b(antitrust|monopoly|class\s+action)\s+(case|lawsuit|ruling|investigation|settlement)\b/i,

  // Research intent that benefits from live data
  /\b(search\s+for|search\s+the\s+web|search\s+online|look\s+up|google|browse\s+for)\s+(me\s+)?(the|some|any)?\b/i,
  /\bfind\s+(me\s+)?(the|some|any|information|details|data|results|articles|reviews)\b/i,
  /\bwhat\s+are\s+people\s+saying\s+(about|regarding)\b/i,
  /\bpublic\s+(opinion|sentiment|reaction|response)\s+(on|to|about|regarding)\b/i,
  /\b(reviews?|ratings?|feedback|testimonials?)\s+(for|of|on|about)\b/i,
  /\b(compare|comparison)\s+(of|between)\s+.{0,40}\s+(prices?|costs?|specs?|features?|plans?)\b/i,

  // Comparison with current state
  /\bis\s+.{1,40}\s+still\s+(open|available|running|active|alive|working|valid|legal|supported|in\s+business|operational|free|online|around)\b/i,
  /\bhas\s+.{1,40}\s+been\s+(released|updated|fixed|resolved|cancelled|postponed|changed|discontinued|recalled|approved|banned)\b/i,
  /\bdoes\s+.{1,40}\s+still\s+(exist|work|support|offer|have|accept|ship|deliver|operate|make)\b/i,
  /\bwhat\s+is\s+the\s+(current|latest|newest|most\s+recent|actual|real)\b/i,

  // Social media and trends
  /\b(trending|viral|popular|top)\s+(on|tweets?|posts?|videos?|topics?|hashtags?|memes?|challenges?)\b/i,
  /\b(viral|trending|popular)\s+(tiktok|twitter|instagram|reddit|youtube|twitch|threads)\b/i,
  /\b(tiktok|twitter|x\.com|instagram|reddit|youtube|twitch|threads|bluesky|mastodon)\s+(trending|popular|viral|drama|controversy|ban)\b/i,
  /\bwhat\s+is\s+everyone\s+(talking|posting|tweeting|saying)\s+about\b/i,

  // Disaster and emergency
  /\b(earthquake|tsunami|hurricane|tornado|wildfire|flood|eruption|cyclone|typhoon|avalanche|landslide)\s+(in|near|today|current|latest|warning|alert|update|damage|casualties)\b/i,
  /\b(evacuation|emergency|alert|warning|amber\s+alert|silver\s+alert)\s+(in|for|near|current|issued)\b/i,
  /\b(power\s+outage|blackout|water\s+shortage)\s+(in|near|current|update|map)\b/i,

  // Shipping and delivery
  /\b(track|tracking|shipment|delivery|package)\s+(status|update|where|number|info)\b/i,
  /\bwhere\s+is\s+my\s+(package|order|delivery|shipment|mail)\b/i,

  // Cryptocurrency and blockchain
  /\b(bitcoin|btc|ethereum|eth|solana|sol|crypto|nft|defi)\s+(price|value|today|now|current|market|crash|pump|dump|halving)\b/i,
  /\b(gas\s+fees?|network\s+fees?|mining|staking|yield)\s+(current|now|today|average|low|high)\b/i,
  /\b(airdrop|token\s+launch|ico|ido)\s+(today|upcoming|new|live|current)\b/i,

  // Events and schedules
  /\b(concert|show|game|match|event|conference|expo|convention|festival|meetup|hackathon)\s+(schedule|dates?|tickets?|lineup|agenda|speakers?)\s*(for|in|near|today|this\s+week|this\s+weekend)?\b/i,
  /\bwhen\s+is\s+(the\s+next|the\s+upcoming|the\s+latest)\b/i,
  /\b(hours?|schedule|open|opening|closing)\s+(of|for|at|times?)\b/i,
  /\b(sold\s+out|tickets?\s+available|presale|on\s+sale)\s*(for|at|now|today)?\b/i,

  // Jobs and hiring
  /\b(hiring|jobs?|openings?|positions?|vacancies?|careers?)\s+(at|for|in|near|remote)\b/i,
  /\bis\s+.{1,30}\s+(hiring|recruiting)\b/i,
  /\b(salary|compensation|pay|wage)\s+(for|at|range|average|median)\b/i,
  /\b(glassdoor|indeed|linkedin)\s+(reviews?|ratings?|salary|jobs?)\b/i,
  /\b(tech\s+layoffs?|hiring\s+freeze|job\s+market|unemployment)\s*(2024|2025|2026|today|current|latest)?\b/i,

  // Restaurant and food
  /\b(menu|specials?|happy\s+hour|reservations?|wait\s+time)\s+(at|for)\b/i,
  /\b(restaurants?|cafes?|bars?|pubs?|bakeries?)\s+(near|open|best|top|new|recommended)\b/i,
  /\b(uber\s+eats?|doordash|grubhub|deliveroo|postmates|just\s+eat|menulog)\b/i,
  /\b(michelin|zagat)\s+(star|rated|guide|restaurant)\b/i,

  // Population, demographics, statistics
  /\b(population|gdp|unemployment\s+rate|crime\s+rate|literacy\s+rate|birth\s+rate|death\s+rate|poverty\s+rate|homelessness)\s+(of|in|for|current|latest|2024|2025|2026)\b/i,
  /\bhow\s+many\s+people\s+(live|are|were|died|voted|immigrated)\s+(in|at|to|from)\b/i,

  // Availability and status checks
  /\b(is|are)\s+.{1,40}\s+(down|offline|working|up|running|available|out\s+of\s+stock|in\s+stock|back\s+in\s+stock|discontinued|recalled)\b/i,
  /\b(status|uptime|downtime|outage|incident)\s+(of|for|check|page|dashboard)\b/i,
  /\b(server|service|website|app|site)\s+(status|down|up|outage|issue|problem)\b/i,

  // Academic and research
  /\b(latest|recent|new|2024|2025|2026)\s+(study|studies|research|paper|papers|findings?|publication)\s+(on|about|in|from|shows?|suggests?|found|reveals?)\b/i,
  /\b(peer.?reviewed|preprint|arxiv|pubmed|nature|science|lancet)\s+(paper|article|study|research)\b/i,

  // Environmental and climate
  /\b(carbon|co2|emissions?|pollution|air\s+quality)\s+(levels?|data|today|current|index|map)\b/i,
  /\b(sea\s+level|glacier|ice\s+cap|deforestation|ozone)\s+(current|latest|data|level|rate|update)\b/i,
  /\b(renewable\s+energy|solar|wind\s+power|ev|electric\s+vehicle)\s+(market|share|capacity|production|sales|stats)\b/i,

  // Space and astronomy
  /\b(nasa|spacex|blue\s+origin|esa|isro|jaxa)\s+(launch|mission|update|news|announcement)\b/i,
  /\b(iss|international\s+space\s+station|satellite)\s+(location|tracker|pass|visible|update)\b/i,
  /\b(asteroid|meteor|comet|eclipse|conjunction|supermoon)\s+(today|tonight|when|visible|approaching|near)\b/i,

  // Telecommunications and internet
  /\b(5g|broadband|internet|wifi)\s+(coverage|speeds?|availability|plans?|pricing|outage)\s*(in|near|for|at)?\b/i,
  /\b(data\s+breach|hack|cyber\s*attack|security\s+incident|leak)\s+(at|of|by|today|recent|latest|new)\b/i,
];

// Phrases that strongly indicate a web search is needed (checked against lowered prompt)
const WEB_SEARCH_PHRASE_INDICATORS: string[] = [
  'search the web', 'search online', 'search the internet', 'search google',
  'look it up', 'look this up', 'look that up', 'look up online',
  'find out', 'find me', 'find information',
  'google it', 'google this', 'google that',
  'check online', 'check the internet', 'check the web',
  'what time is it', 'what day is it',
  'in the news', 'on the news', 'news today', 'today\'s news',
  'right now', 'as of today', 'as of now', 'at the moment',
  'most recent', 'most up-to-date',
  'live update', 'live data', 'live score', 'live results',
  'current status', 'current state', 'current situation',
  'latest version', 'latest release', 'latest update', 'latest news',
  'still available', 'still open', 'still running', 'still alive',
  'what\'s new', 'whats new', 'what is new',
  'where can i buy', 'where can i find', 'where can i get',
  'where to buy', 'where to find', 'where to get',
  'near me', 'close to me', 'around me', 'in my area',
  'best places to', 'top rated', 'highest rated', 'best reviewed',
  'on sale', 'on discount', 'best deal', 'best price',
  'who is the current', 'who is the new',
  'did they', 'has it been', 'have they',
  'what\'s trending', 'whats trending',
  'how much does it cost', 'what does it cost',
  'is it true that', 'is it real that',
];

// Domains that inherently benefit from web search
const WEB_SEARCH_DOMAINS = new Set([
  'weather', 'sports', 'shopping',
]);

// Detect if a prompt requires web search
export function detectWebSearchRequired(prompt: string, intent?: Intent, domain?: Domain): boolean {
  const lowerPrompt = prompt.toLowerCase();
  const tokens = new Set(tokenize(prompt));

  // Check 1: Direct phrase indicators (highest confidence)
  for (const phrase of WEB_SEARCH_PHRASE_INDICATORS) {
    if (lowerPrompt.includes(phrase)) {
      return true;
    }
  }

  // Check 2: Pattern matching against real-time data patterns
  if (matchesPatterns(prompt, REALTIME_DATA_PATTERNS)) {
    return true;
  }

  // Check 3: Domain-based signals (weather, sports, shopping inherently need fresh data)
  if (domain && WEB_SEARCH_DOMAINS.has(domain)) {
    // Only if the prompt actually asks a question or requests info
    if (lowerPrompt.includes('?') ||
        tokens.has('what') || tokens.has('how') || tokens.has('when') ||
        tokens.has('where') || tokens.has('who') || tokens.has('which') ||
        tokens.has('tell') || tokens.has('show') || tokens.has('find') ||
        tokens.has('get') || tokens.has('check')) {
      return true;
    }
  }

  // Check 4: Temporal keyword and phrase scoring (accumulate signals)
  let temporalSignalCount = 0;

  // Check multi-word phrases first
  for (const phrase of TEMPORAL_PHRASES) {
    if (lowerPrompt.includes(phrase)) {
      temporalSignalCount += 2;
    }
  }

  // Check single-word temporal keywords
  for (const keyword of TEMPORAL_KEYWORDS) {
    if (tokens.has(keyword)) {
      temporalSignalCount++;
    }
  }

  // If we have strong temporal signals
  if (temporalSignalCount >= 2) {
    return true;
  }

  // Check 5: Intent-based boost for research
  if (intent === Intent.Research && temporalSignalCount >= 1) {
    return true;
  }

  // Check 6: Question patterns asking about current/real-world state
  const currentStatePatterns = [
    /\bwho\s+is\s+the\s+(current|new|acting|interim|present)\b/i,
    /\bwhat\s+is\s+the\s+(current|latest|new|best|cheapest|fastest|most\s+popular|most\s+expensive|highest|lowest)\b/i,
    /\bhow\s+much\s+(does|do|is|are|did|will)\b/i,
    /\bwhere\s+(is|are|can|do|does|should|would)\b/i,
    /\bwhen\s+(is|does|will|did|was)\s+(the\s+next|the\s+upcoming|the\s+latest)\b/i,
    /\bcan\s+i\s+(buy|get|order|find|watch|stream|download|rent|book|reserve)\b/i,
    /\bis\s+there\s+(a|an)\s+.{1,40}\s+(near|in|at|for|around|close)\b/i,
  ];

  for (const pattern of currentStatePatterns) {
    if (pattern.test(prompt)) {
      return true;
    }
  }

  return false;
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
    case 'code':
      return Modality.Code;
    case 'image':
      return Modality.Image;
    case 'video':
      return Modality.Video;
    case 'voice':
      return Modality.Voice;
    case 'document':
    case 'doc':
    case 'pdf':
      return Modality.Document;
    case 'text+image':
    case 'textimage':
    case 'text_image':
      return Modality.TextImage;
    case 'text+voice':
    case 'textvoice':
    case 'text_voice':
      return Modality.TextVoice;
    case 'text+code':
    case 'textcode':
    case 'text_code':
      return Modality.TextCode;
    case 'text+video':
    case 'textvideo':
    case 'text_video':
      return Modality.TextVideo;
    default:
      return Modality.Text;
  }
}

export function isPureModality(modality: Modality): boolean {
  return modality === Modality.Image || modality === Modality.Voice || modality === Modality.Video;
}

export function isCombinedModality(modality: Modality): boolean {
  return modality === Modality.TextImage || modality === Modality.TextVoice || modality === Modality.TextVideo;
}

export function getModalityType(modality: Modality): 'text' | 'vision' | 'audio' {
  switch (modality) {
    case Modality.Image:
    case Modality.TextImage:
    case Modality.Video:
    case Modality.TextVideo:
      return 'vision';
    case Modality.Voice:
    case Modality.TextVoice:
      return 'audio';
    default:
      return 'text';
  }
}
