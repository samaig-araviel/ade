import {
  Modality,
  Mood,
  EnergyLevel,
  Weather,
  Location,
  ResponseStyle,
  ResponseLength,
  FeedbackSignal,
} from './enums';

// Conversation context
export interface ConversationContext {
  userId?: string;
  conversationId?: string;
  previousModelUsed?: string;
  messageCount?: number;
  sessionDurationMinutes?: number;
}

// Emotional state in human context
export interface EmotionalState {
  mood?: Mood;
  energyLevel?: EnergyLevel;
}

// Temporal context
export interface TemporalContext {
  localTime?: string; // HH:MM format
  timezone?: string;
  dayOfWeek?: string;
  isWorkingHours?: boolean;
}

// Environmental context
export interface EnvironmentalContext {
  weather?: Weather;
  location?: Location;
}

// User preferences
export interface UserPreferences {
  preferredResponseStyle?: ResponseStyle;
  preferredResponseLength?: ResponseLength;
  preferredModels?: string[];
  avoidModels?: string[];
}

// History hints
export interface HistoryHints {
  recentTopics?: string[];
  frequentIntents?: string[];
}

// Complete human context - all fields optional
export interface HumanContext {
  emotionalState?: EmotionalState;
  temporalContext?: TemporalContext;
  environmentalContext?: EnvironmentalContext;
  preferences?: UserPreferences;
  historyHints?: HistoryHints;
}

// Hard constraints
export interface Constraints {
  maxCostPer1kTokens?: number;
  maxLatencyMs?: number;
  allowedModels?: string[];
  excludedModels?: string[];
  requireStreaming?: boolean;
  requireVision?: boolean;
  requireAudio?: boolean;
}

// Main route request
export interface RouteRequest {
  prompt: string;
  modality: Modality;
  context?: ConversationContext;
  humanContext?: HumanContext;
  constraints?: Constraints;
}

// Analyze-only request
export interface AnalyzeRequest {
  prompt: string;
  modality: Modality;
}

// Feedback request
export interface FeedbackRequest {
  decisionId: string;
  signal: FeedbackSignal;
  comment?: string;
}
