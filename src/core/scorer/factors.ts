import {
  ModelDefinition,
  QueryAnalysis,
  HumanContext,
  ConversationContext,
  FactorScore,
  Modality,
  Mood,
  EnergyLevel,
  ResponseStyle,
  ResponseLength,
} from '@/types';
import { clamp, normalize, invertScore, parseTimeToHours, isLateNight, isWorkingHours } from '@/lib/helpers';

// Calculate task fitness score
export function calculateTaskFitness(
  model: ModelDefinition,
  analysis: QueryAnalysis
): FactorScore {
  const intentScore = model.taskStrengths.intents[analysis.intent];
  const domainScore = model.taskStrengths.domains[analysis.domain];
  const complexityScore = model.taskStrengths.complexity[analysis.complexity];

  // Weighted combination: 50% intent, 30% domain, 20% complexity
  const score = (intentScore * 0.5) + (domainScore * 0.3) + (complexityScore * 0.2);

  const intentPercent = Math.round(intentScore * 100);
  const domainPercent = Math.round(domainScore * 100);

  let detail: string;
  if (score >= 0.9) {
    detail = `Excels at ${analysis.intent} tasks (${intentPercent}%) with strong ${analysis.domain} domain knowledge (${domainPercent}%)`;
  } else if (score >= 0.8) {
    detail = `Strong fit for ${analysis.intent} (${intentPercent}%) and handles ${analysis.domain} topics well (${domainPercent}%)`;
  } else if (score >= 0.7) {
    detail = `Capable at ${analysis.intent} tasks (${intentPercent}%) with decent ${analysis.domain} knowledge (${domainPercent}%)`;
  } else {
    detail = `Can handle ${analysis.intent} (${intentPercent}%) though not its strongest area for ${analysis.domain} (${domainPercent}%)`;
  }

  return {
    name: 'Task Fitness',
    score,
    weight: 0,
    weightedScore: 0,
    detail,
  };
}

// Calculate modality fitness score
export function calculateModalityFitness(
  model: ModelDefinition,
  analysis: QueryAnalysis
): FactorScore {
  let score = 1.0;
  let detail = 'Text-only request - all models supported';

  switch (analysis.modality) {
    case Modality.Image:
    case Modality.TextImage:
      score = model.capabilities.supportsVision
        ? model.capabilities.visionScore
        : 0;
      if (score >= 0.9) {
        detail = `Excellent vision capabilities (${Math.round(score * 100)}%) for image understanding`;
      } else if (score >= 0.8) {
        detail = `Strong vision support (${Math.round(score * 100)}%) for image analysis`;
      } else if (score > 0) {
        detail = `Basic vision capabilities (${Math.round(score * 100)}%)`;
      } else {
        detail = 'Does not support vision/image input';
      }
      break;

    case Modality.Voice:
    case Modality.TextVoice:
      score = model.capabilities.supportsAudio
        ? model.capabilities.audioScore
        : 0;
      if (score >= 0.9) {
        detail = `Excellent audio processing (${Math.round(score * 100)}%) for voice input`;
      } else if (score >= 0.8) {
        detail = `Strong audio support (${Math.round(score * 100)}%) for voice handling`;
      } else if (score > 0) {
        detail = `Basic audio capabilities (${Math.round(score * 100)}%)`;
      } else {
        detail = 'Does not support audio/voice input';
      }
      break;
  }

  return {
    name: 'Modality Fitness',
    score,
    weight: 0,
    weightedScore: 0,
    detail,
  };
}

// Calculate cost efficiency score
export function calculateCostEfficiency(
  model: ModelDefinition,
  allModels: ModelDefinition[]
): FactorScore {
  const avgCost = (model.pricing.inputPer1k + model.pricing.outputPer1k) / 2;

  // Find min and max costs
  const costs = allModels.map((m) => (m.pricing.inputPer1k + m.pricing.outputPer1k) / 2);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);

  // Normalize and invert (cheaper = higher score)
  const normalized = normalize(avgCost, minCost, maxCost);
  const score = invertScore(normalized);

  const costStr = avgCost < 0.001
    ? `$${(avgCost * 1000).toFixed(3)}/million tokens`
    : `$${avgCost.toFixed(4)}/1K tokens`;

  let detail: string;
  if (score >= 0.9) {
    detail = `Very cost-effective at ${costStr}`;
  } else if (score >= 0.7) {
    detail = `Reasonably priced at ${costStr}`;
  } else if (score >= 0.4) {
    detail = `Mid-range pricing at ${costStr}`;
  } else {
    detail = `Premium pricing at ${costStr}`;
  }

  return {
    name: 'Cost Efficiency',
    score,
    weight: 0,
    weightedScore: 0,
    detail,
  };
}

// Calculate speed score
export function calculateSpeed(
  model: ModelDefinition,
  allModels: ModelDefinition[]
): FactorScore {
  const latency = model.performance.avgLatencyMs;

  // Find min and max latencies
  const latencies = allModels.map((m) => m.performance.avgLatencyMs);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  // Normalize and invert (faster = higher score)
  const normalized = normalize(latency, minLatency, maxLatency);
  const score = invertScore(normalized);

  let detail: string;
  if (latency < 500) {
    detail = `Very fast responses (~${latency}ms average)`;
  } else if (latency < 1000) {
    detail = `Quick responses (~${latency}ms average)`;
  } else if (latency < 2000) {
    detail = `Moderate response time (~${(latency / 1000).toFixed(1)}s average)`;
  } else {
    detail = `Slower responses (~${(latency / 1000).toFixed(1)}s average) but thorough`;
  }

  return {
    name: 'Speed',
    score,
    weight: 0,
    weightedScore: 0,
    detail,
  };
}

// Calculate conversation coherence score
export function calculateConversationCoherence(
  model: ModelDefinition,
  conversationContext?: ConversationContext
): FactorScore {
  if (!conversationContext?.previousModelUsed) {
    return {
      name: 'Conversation Coherence',
      score: 0.5,
      weight: 0,
      weightedScore: 0,
      detail: 'New conversation - no prior model to maintain coherence with',
    };
  }

  const previousModel = conversationContext.previousModelUsed;
  let score: number;
  let detail: string;

  if (model.id === previousModel) {
    score = 1.0;
    detail = 'Same model as previous message - maintains perfect conversation coherence';
  } else if (previousModel.includes(model.provider)) {
    score = 0.7;
    detail = `Same provider (${model.provider}) - good conversation continuity`;
  } else {
    score = 0.4;
    detail = 'Different provider from previous message - may affect conversation flow';
  }

  return {
    name: 'Conversation Coherence',
    score,
    weight: 0,
    weightedScore: 0,
    detail,
  };
}

// Calculate user preference score
export function calculateUserPreference(
  model: ModelDefinition,
  humanContext?: HumanContext
): FactorScore {
  let score = 0.5; // Neutral default
  let detail = 'No explicit model preferences specified';

  const preferredModels = humanContext?.preferences?.preferredModels ?? [];
  const avoidModels = humanContext?.preferences?.avoidModels ?? [];

  if (preferredModels.includes(model.id)) {
    score = clamp(score + 0.4, 0, 1);
    detail = 'Matches your preferred models list';
  }

  if (avoidModels.includes(model.id)) {
    score = clamp(score - 0.4, 0, 1);
    detail = 'In your avoid list - not preferred';
  }

  if (preferredModels.length === 0 && avoidModels.length === 0) {
    detail = 'No model preferences configured';
  }

  return {
    name: 'User Preference',
    score,
    weight: 0,
    weightedScore: 0,
    detail,
  };
}

// Calculate human context fit score
export function calculateHumanContextFit(
  model: ModelDefinition,
  humanContext?: HumanContext
): FactorScore | null {
  if (!humanContext) {
    return null;
  }

  const subscores: number[] = [];
  const details: string[] = [];

  // Mood fit
  const moodFit = calculateMoodFit(model, humanContext.emotionalState?.mood);
  if (moodFit !== null) {
    subscores.push(moodFit.score);
    details.push(moodFit.detail);
  }

  // Energy fit
  const energyFit = calculateEnergyFit(model, humanContext.emotionalState?.energyLevel);
  if (energyFit !== null) {
    subscores.push(energyFit.score);
    details.push(energyFit.detail);
  }

  // Time fit
  const timeFit = calculateTimeFit(model, humanContext.temporalContext);
  if (timeFit !== null) {
    subscores.push(timeFit.score);
    details.push(timeFit.detail);
  }

  // Style fit
  const styleFit = calculateStyleFit(model, humanContext.preferences);
  if (styleFit !== null) {
    subscores.push(styleFit.score);
    details.push(styleFit.detail);
  }

  // If no subscores, return null
  if (subscores.length === 0) {
    return null;
  }

  // Average subscores
  const score = subscores.reduce((a, b) => a + b, 0) / subscores.length;

  // Pick the most relevant detail
  const detail = details[0] ?? 'Considers your personal context';

  return {
    name: 'Human Context Fit',
    score,
    weight: 0,
    weightedScore: 0,
    detail,
  };
}

// Helper: Calculate mood fit
function calculateMoodFit(
  model: ModelDefinition,
  mood?: Mood
): { score: number; detail: string } | null {
  if (!mood) return null;

  let score: number;
  let detail: string;

  switch (mood) {
    case Mood.Frustrated:
    case Mood.Stressed:
    case Mood.Anxious:
      score = model.humanFactors.empathyScore;
      detail = score >= 0.85
        ? 'Really understands when you\'re stressed - responds with patience'
        : score >= 0.7
          ? 'Good at providing calm, supportive responses'
          : 'May not be the most empathetic choice right now';
      break;

    case Mood.Excited:
    case Mood.Happy:
      score = model.humanFactors.playfulnessScore;
      detail = score >= 0.85
        ? 'Great at matching your playful energy'
        : score >= 0.7
          ? 'Can engage with your good mood'
          : 'Tends to be more serious in tone';
      break;

    case Mood.Tired:
      score = model.humanFactors.conciseness;
      detail = score >= 0.85
        ? 'Gives quick, focused answers when you\'re tired'
        : score >= 0.7
          ? 'Reasonably concise responses'
          : 'May give longer responses than you want right now';
      break;

    case Mood.Calm:
    case Mood.Neutral:
    default:
      score = 0.8; // Neutral, most models work fine
      detail = 'Works well for your current state';
      break;
  }

  return { score, detail };
}

// Helper: Calculate energy fit
function calculateEnergyFit(
  model: ModelDefinition,
  energyLevel?: EnergyLevel
): { score: number; detail: string } | null {
  if (!energyLevel) return null;

  let score: number;
  let detail: string;

  switch (energyLevel) {
    case EnergyLevel.Low:
      score = model.humanFactors.conciseness;
      detail = score >= 0.85
        ? 'Perfect for low energy - keeps responses short and clear'
        : score >= 0.7
          ? 'Reasonably brief when you need it'
          : 'Might be more verbose than you want';
      break;

    case EnergyLevel.High:
      // High energy can handle more verbose, conversational models
      score = (model.humanFactors.verbosity + model.humanFactors.conversationalTone) / 2;
      detail = score >= 0.8
        ? 'Can match your high energy with engaging responses'
        : 'Provides solid responses for your energy level';
      break;

    case EnergyLevel.Moderate:
    default:
      score = 0.8;
      detail = 'Good balance for your current energy';
      break;
  }

  return { score, detail };
}

// Helper: Calculate time fit
function calculateTimeFit(
  model: ModelDefinition,
  temporalContext?: { localTime?: string; isWorkingHours?: boolean }
): { score: number; detail: string } | null {
  if (!temporalContext?.localTime && temporalContext?.isWorkingHours === undefined) {
    return null;
  }

  let score = 0.8;
  let detail = 'Works well at any time';

  // Check local time
  if (temporalContext.localTime) {
    const hours = parseTimeToHours(temporalContext.localTime);
    if (hours !== null) {
      if (isLateNight(hours)) {
        score = model.humanFactors.lateNightSuitability;
        detail = score >= 0.85
          ? 'Perfect for late night - won\'t overwhelm you'
          : score >= 0.7
            ? 'Works reasonably well at this hour'
            : 'Might be a bit much for late night';
      } else if (isWorkingHours(hours)) {
        score = model.humanFactors.workHoursSuitability;
        detail = score >= 0.9
          ? 'Ideal for work hours - professional and efficient'
          : 'Suitable for work time use';
      }
    }
  }

  // Override with explicit working hours flag
  if (temporalContext.isWorkingHours === true) {
    score = model.humanFactors.workHoursSuitability;
    detail = score >= 0.9
      ? 'Well-suited for your work context'
      : 'Can handle professional tasks';
  } else if (temporalContext.isWorkingHours === false) {
    score = model.humanFactors.lateNightSuitability;
    detail = 'Good for after-hours use';
  }

  return { score, detail };
}

// Helper: Calculate style fit
function calculateStyleFit(
  model: ModelDefinition,
  preferences?: { preferredResponseStyle?: ResponseStyle; preferredResponseLength?: ResponseLength }
): { score: number; detail: string } | null {
  if (!preferences?.preferredResponseStyle && !preferences?.preferredResponseLength) {
    return null;
  }

  let score = 0.8;
  let detail = 'Adapts to your preferred style';

  // Response style preference
  if (preferences.preferredResponseStyle) {
    switch (preferences.preferredResponseStyle) {
      case ResponseStyle.Concise:
        score = model.humanFactors.conciseness;
        detail = score >= 0.85
          ? 'Excellent at giving concise responses'
          : score >= 0.7
            ? 'Can keep responses reasonably short'
            : 'Tends to be more detailed';
        break;

      case ResponseStyle.Detailed:
        score = model.humanFactors.verbosity;
        detail = score >= 0.85
          ? 'Great at providing detailed, thorough responses'
          : score >= 0.7
            ? 'Provides good detail when needed'
            : 'Keeps things relatively brief';
        break;

      case ResponseStyle.Conversational:
        score = model.humanFactors.conversationalTone;
        detail = score >= 0.85
          ? 'Natural, conversational style that feels like chatting'
          : score >= 0.7
            ? 'Fairly conversational approach'
            : 'More formal in tone';
        break;

      case ResponseStyle.Formal:
        score = model.humanFactors.formalTone;
        detail = score >= 0.9
          ? 'Professional and formal communication style'
          : score >= 0.7
            ? 'Can maintain formal tone'
            : 'More casual by default';
        break;

      case ResponseStyle.Casual:
        score = model.humanFactors.conversationalTone * 0.8 + model.humanFactors.playfulnessScore * 0.2;
        detail = score >= 0.8
          ? 'Relaxed, casual communication style'
          : 'Slightly more formal than casual';
        break;
    }
  }

  // Response length preference
  if (preferences.preferredResponseLength) {
    let lengthScore: number;
    switch (preferences.preferredResponseLength) {
      case ResponseLength.Short:
        lengthScore = model.humanFactors.conciseness;
        break;
      case ResponseLength.Long:
        lengthScore = model.humanFactors.verbosity;
        break;
      case ResponseLength.Medium:
      default:
        lengthScore = 0.8;
        break;
    }

    // Average with style score
    score = (score + lengthScore) / 2;
  }

  return { score, detail };
}
