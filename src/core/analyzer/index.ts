import { QueryAnalysis, Modality, HumanContext } from '@/types';
import {
  detectIntent,
  detectDomain,
  detectComplexity,
  detectTone,
  extractPromptKeywords,
  parseModality,
} from './detectors';

export {
  detectIntent,
  detectDomain,
  detectComplexity,
  detectTone,
  extractPromptKeywords,
  parseModality,
  isPureModality,
  isCombinedModality,
  getModalityType,
} from './detectors';

// Main analysis function
export function analyze(
  prompt: string,
  modality: Modality | string,
  humanContext?: HumanContext
): QueryAnalysis {
  // Parse modality if it's a string
  const parsedModality = typeof modality === 'string'
    ? parseModality(modality)
    : modality;

  // Run all detectors
  const intent = detectIntent(prompt);
  const domain = detectDomain(prompt);
  const complexity = detectComplexity(prompt);
  const tone = detectTone(prompt);
  const keywords = extractPromptKeywords(prompt);

  // Check if human context was provided and has any meaningful data
  const humanContextUsed = hasSignificantHumanContext(humanContext);

  return {
    intent,
    domain,
    complexity,
    tone,
    modality: parsedModality,
    keywords,
    humanContextUsed,
  };
}

// Check if human context has any significant data
function hasSignificantHumanContext(humanContext?: HumanContext): boolean {
  if (!humanContext) return false;

  // Check emotional state
  if (humanContext.emotionalState?.mood || humanContext.emotionalState?.energyLevel) {
    return true;
  }

  // Check temporal context
  if (humanContext.temporalContext?.localTime || humanContext.temporalContext?.isWorkingHours !== undefined) {
    return true;
  }

  // Check environmental context
  if (humanContext.environmentalContext?.weather || humanContext.environmentalContext?.location) {
    return true;
  }

  // Check preferences
  if (humanContext.preferences?.preferredResponseStyle ||
      humanContext.preferences?.preferredResponseLength ||
      (humanContext.preferences?.preferredModels && humanContext.preferences.preferredModels.length > 0) ||
      (humanContext.preferences?.avoidModels && humanContext.preferences.avoidModels.length > 0)) {
    return true;
  }

  // Check history hints
  if ((humanContext.historyHints?.recentTopics && humanContext.historyHints.recentTopics.length > 0) ||
      (humanContext.historyHints?.frequentIntents && humanContext.historyHints.frequentIntents.length > 0)) {
    return true;
  }

  return false;
}

// Default analysis for fallback scenarios
export function getDefaultAnalysis(modality: Modality = Modality.Text): QueryAnalysis {
  return {
    intent: 'conversation' as QueryAnalysis['intent'],
    domain: 'general' as QueryAnalysis['domain'],
    complexity: 'standard' as QueryAnalysis['complexity'],
    tone: 'casual' as QueryAnalysis['tone'],
    modality,
    keywords: [],
    humanContextUsed: false,
  };
}
