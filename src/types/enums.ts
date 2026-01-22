// User intent - what they're trying to accomplish
export enum Intent {
  Coding = 'coding',
  Creative = 'creative',
  Analysis = 'analysis',
  Factual = 'factual',
  Conversation = 'conversation',
  Task = 'task',
  Brainstorm = 'brainstorm',
  Translation = 'translation',
  Summarization = 'summarization',
  Extraction = 'extraction',
}

// Subject domain
export enum Domain {
  Technology = 'technology',
  Business = 'business',
  Health = 'health',
  Legal = 'legal',
  Finance = 'finance',
  Education = 'education',
  Science = 'science',
  CreativeArts = 'creative_arts',
  Lifestyle = 'lifestyle',
  General = 'general',
}

// Complexity level with user-friendly names
export enum Complexity {
  Quick = 'quick', // Simple tasks
  Standard = 'standard', // Typical everyday tasks
  Demanding = 'demanding', // Complex multi-step tasks
}

// Detected user emotional tone
export enum Tone {
  Casual = 'casual',
  Focused = 'focused',
  Curious = 'curious',
  Frustrated = 'frustrated',
  Urgent = 'urgent',
  Playful = 'playful',
  Professional = 'professional',
}

// Input modality
export enum Modality {
  Text = 'text',
  Image = 'image',
  Voice = 'voice',
  TextImage = 'text+image',
  TextVoice = 'text+voice',
}

// LLM provider
export type Provider = 'anthropic' | 'openai' | 'google';

// Mood states for human context
export enum Mood {
  Happy = 'happy',
  Neutral = 'neutral',
  Stressed = 'stressed',
  Frustrated = 'frustrated',
  Excited = 'excited',
  Tired = 'tired',
  Anxious = 'anxious',
  Calm = 'calm',
}

// Energy levels
export enum EnergyLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
}

// Weather conditions
export enum Weather {
  Sunny = 'sunny',
  Cloudy = 'cloudy',
  Rainy = 'rainy',
  Stormy = 'stormy',
  Snowy = 'snowy',
  Hot = 'hot',
  Cold = 'cold',
}

// Location context
export enum Location {
  Home = 'home',
  Office = 'office',
  Commute = 'commute',
  Travel = 'travel',
  Other = 'other',
}

// Response style preferences
export enum ResponseStyle {
  Concise = 'concise',
  Detailed = 'detailed',
  Conversational = 'conversational',
  Formal = 'formal',
  Casual = 'casual',
}

// Response length preferences
export enum ResponseLength {
  Short = 'short',
  Medium = 'medium',
  Long = 'long',
}

// Feedback signal
export enum FeedbackSignal {
  Positive = 'positive',
  Neutral = 'neutral',
  Negative = 'negative',
}

// Factor impact for reasoning
export enum FactorImpact {
  Positive = 'positive',
  Neutral = 'neutral',
  Negative = 'negative',
}
