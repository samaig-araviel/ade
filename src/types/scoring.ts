import { ModelDefinition } from './models';
import { QueryAnalysis } from './responses';
import { HumanContext, Constraints, ConversationContext } from './requests';
import { AccessTier, RoutingStrategy } from './enums';

// Individual factor score
export interface FactorScore {
  name: string;
  score: number; // 0-1
  weight: number;
  weightedScore: number;
  detail: string; // Human-readable explanation
}

// Complete scoring result for a model
export interface ModelScore {
  model: ModelDefinition;
  factors: FactorScore[];
  compositeScore: number;
}

// Scoring context passed to scorers
export interface ScoringContext {
  analysis: QueryAnalysis;
  humanContext?: HumanContext;
  constraints?: Constraints;
  conversationContext?: ConversationContext;
  allModels: ModelDefinition[];
  conversationHasImages?: boolean;
  strategy?: RoutingStrategy;
  userTier?: AccessTier;
}

// Weights configuration
export interface ScoringWeights {
  taskFitness: number;
  specialization: number;
  modalityFitness: number;
  costEfficiency: number;
  userPreference: number;
  conversationCoherence: number;
  speed: number;
  humanContextFit?: number;
}

// ── Weight profiles ───────────────────────────────────────────────────────────
// All profiles sum to 1.0. Each strategy shifts emphasis to match user intent.

// Auto: default routing — task fitness is primary, other factors secondary
export const DEFAULT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.38,
  specialization: 0.18,
  modalityFitness: 0.15,
  costEfficiency: 0.08,
  userPreference: 0.08,
  conversationCoherence: 0.06,
  speed: 0.07,
};

// Auto + human context
export const HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.28,
  specialization: 0.14,
  modalityFitness: 0.12,
  costEfficiency: 0.06,
  userPreference: 0.08,
  conversationCoherence: 0.06,
  speed: 0.06,
  humanContextFit: 0.20,
};

// Balanced: even distribution — no single factor dominates
export const BALANCED_WEIGHTS: ScoringWeights = {
  taskFitness: 0.22,
  specialization: 0.14,
  modalityFitness: 0.12,
  costEfficiency: 0.12,
  userPreference: 0.08,
  conversationCoherence: 0.08,
  speed: 0.24,
};

// Balanced + human context
export const BALANCED_HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.18,
  specialization: 0.10,
  modalityFitness: 0.10,
  costEfficiency: 0.10,
  userPreference: 0.06,
  conversationCoherence: 0.06,
  speed: 0.20,
  humanContextFit: 0.20,
};

// Quality: best model for the task — cost and speed are near-irrelevant
export const QUALITY_WEIGHTS: ScoringWeights = {
  taskFitness: 0.42,
  specialization: 0.25,
  modalityFitness: 0.15,
  costEfficiency: 0.02,
  userPreference: 0.06,
  conversationCoherence: 0.06,
  speed: 0.04,
};

// Quality + human context
export const QUALITY_HUMAN_CONTEXT_WEIGHTS: ScoringWeights = {
  taskFitness: 0.32,
  specialization: 0.18,
  modalityFitness: 0.12,
  costEfficiency: 0.02,
  userPreference: 0.04,
  conversationCoherence: 0.04,
  speed: 0.02,
  humanContextFit: 0.26,
};

// ── Weight resolution ─────────────────────────────────────────────────────────

// Resolve the correct weight profile for a given strategy and human context state
export function resolveWeights(
  strategy: RoutingStrategy | undefined,
  hasHumanContext: boolean
): ScoringWeights {
  switch (strategy) {
    case RoutingStrategy.Balanced:
      return hasHumanContext ? BALANCED_HUMAN_CONTEXT_WEIGHTS : BALANCED_WEIGHTS;
    case RoutingStrategy.Quality:
      return hasHumanContext ? QUALITY_HUMAN_CONTEXT_WEIGHTS : QUALITY_WEIGHTS;
    case RoutingStrategy.Auto:
    default:
      return hasHumanContext ? HUMAN_CONTEXT_WEIGHTS : DEFAULT_WEIGHTS;
  }
}

// ── Web search bonus ──────────────────────────────────────────────────────────

// When the query requires real-time information (webSearchRequired), models that
// support web search receive a significant scoring bonus. This is a correctness
// signal — a model without web search will give stale or wrong answers for
// queries like "what is today's date" or "are we in Easter".
export const WEB_SEARCH_BONUS = 0.20;

// ── Free tier provider preference ─────────────────────────────────────────────

// Free tier auto-selection has historically been dominated by GPT-5 Mini due to
// its 'general_purpose' specialization tag, which gave it a structural advantage
// for conversational, task, and planning intents. The result was a slow,
// homogeneous first-impression experience for free users.
//
// To diversify routing and lead with web-grounded responses (citations,
// real-time data), Perplexity models receive a preference bonus on the Free
// tier — but only for queries where Perplexity is genuinely capable. The intent
// threshold prevents Perplexity from winning queries it would handle poorly
// (coding, math, creative writing), and the Conversation+Quick gate keeps
// short casual replies ("hi", "thanks") on faster lightweight models (Haiku,
// Flash) where Perplexity's higher latency would feel sluggish.
export const FREE_TIER_PROVIDER_PREFERENCE_BONUS = 0.20;

// Minimum task fitness intent score required for a Perplexity model to receive
// the Free tier preference bonus. Below this threshold the model is considered
// a poor fit for the query and the bonus is withheld to avoid steering users
// toward an unsuitable choice.
//
// 0.65 covers Perplexity's reasonable strengths (factual, research, analysis,
// summarization, extraction, conversation, task, planning, brainstorm) while
// excluding intents where Perplexity scores poorly: coding/math (0.60),
// translation (0.60), creative writing (0.55), and all generation modalities
// (image/video/voice/music at 0.0).
export const FREE_TIER_PROVIDER_PREFERENCE_MIN_INTENT_SCORE = 0.65;

// ── Free tier deprioritized models ────────────────────────────────────────────

// Models that the platform considers a poor default for Free tier auto-selection
// despite being technically capable. The penalty pushes them below faster
// alternatives in the same tier (e.g. Claude Haiku 4.5 at 400ms, GPT-4o Mini at
// 500ms, Gemini Flash-Lite at 300ms) without removing them from the model pool —
// they remain available for explicit selection and as backups.
//
// GPT-5 Mini (800ms) is the slowest non-Perplexity text model in the Free tier
// and historically dominated auto-selection because of its 'general_purpose'
// specialization. Slow first-token times produce a worse first impression than
// faster alternatives that handle the same query nearly as well.
export const FREE_TIER_DEPRIORITIZED_MODEL_IDS: ReadonlySet<string> = new Set([
  'gpt-5-mini',
]);

// Penalty applied to deprioritized Free tier models. Sized to push them behind
// peer models of comparable quality but lower latency, without making them
// completely unreachable when the user has no alternative (e.g. provider
// constraints, all other models unavailable).
export const FREE_TIER_DEPRIORITIZATION_PENALTY = 0.15;

// ── Free tier speed preference for non-Perplexity models ──────────────────────

// When Perplexity isn't a good fit (coding, math, creative, translation), Free
// tier routing should favor fast models. The cost factor in the standard
// scoring weights tends to crown the cheapest model in a tier, which produces a
// homogeneous "everything goes to Gemini Flash" outcome on the Free tier. This
// bonus rewards low latency so that faster peers (Claude Haiku 4.5 at 400ms,
// Gemini Flash-Lite at 300ms, GPT-4o Mini at 500ms) can compete on speed even
// when they're more expensive per token. Perplexity is excluded because it has
// its own provider preference bonus.
export const FREE_TIER_SPEED_PREFERENCE_BONUS = 0.06;

// Latency threshold (ms) below which a non-Perplexity Free tier model qualifies
// for the speed preference bonus. Set at 500ms to include the fast workhorses
// while excluding sluggish text models like GPT-5 Mini (800ms) and Grok 4 Fast
// (700ms).
export const FREE_TIER_SPEED_PREFERENCE_MAX_LATENCY_MS = 500;
