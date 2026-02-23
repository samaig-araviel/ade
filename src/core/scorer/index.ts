import {
  ModelDefinition,
  ModelScore,
  ScoringContext,
  FactorScore,
  DEFAULT_WEIGHTS,
  HUMAN_CONTEXT_WEIGHTS,
} from '@/types';
import {
  calculateTaskFitness,
  calculateSpecialization,
  calculateModalityFitness,
  calculateCostEfficiency,
  calculateSpeed,
  calculateConversationCoherence,
  calculateUserPreference,
  calculateHumanContextFit,
} from './factors';

export {
  calculateTaskFitness,
  calculateSpecialization,
  calculateModalityFitness,
  calculateCostEfficiency,
  calculateSpeed,
  calculateConversationCoherence,
  calculateUserPreference,
  calculateHumanContextFit,
} from './factors';

// Score a single model
export function scoreModel(
  model: ModelDefinition,
  context: ScoringContext
): ModelScore {
  const hasHumanContext = !!context.humanContext;
  const weights = hasHumanContext ? HUMAN_CONTEXT_WEIGHTS : DEFAULT_WEIGHTS;

  const factors: FactorScore[] = [];

  // Task Fitness
  const taskFitness = calculateTaskFitness(model, context.analysis);
  taskFitness.weight = weights.taskFitness;
  taskFitness.weightedScore = taskFitness.score * taskFitness.weight;
  factors.push(taskFitness);

  // Specialization Bonus
  const specialization = calculateSpecialization(model, context.analysis);
  specialization.weight = weights.specialization;
  specialization.weightedScore = specialization.score * specialization.weight;
  factors.push(specialization);

  // Modality Fitness
  const modalityFitness = calculateModalityFitness(model, context.analysis);
  modalityFitness.weight = weights.modalityFitness;
  modalityFitness.weightedScore = modalityFitness.score * modalityFitness.weight;
  factors.push(modalityFitness);

  // Cost Efficiency
  const costEfficiency = calculateCostEfficiency(model, context.allModels);
  costEfficiency.weight = weights.costEfficiency;
  costEfficiency.weightedScore = costEfficiency.score * costEfficiency.weight;
  factors.push(costEfficiency);

  // Speed
  const speed = calculateSpeed(model, context.allModels);
  speed.weight = weights.speed;
  speed.weightedScore = speed.score * speed.weight;
  factors.push(speed);

  // Conversation Coherence
  const coherence = calculateConversationCoherence(model, context.conversationContext);
  coherence.weight = weights.conversationCoherence;
  coherence.weightedScore = coherence.score * coherence.weight;
  factors.push(coherence);

  // User Preference
  const preference = calculateUserPreference(model, context.humanContext);
  preference.weight = weights.userPreference;
  preference.weightedScore = preference.score * preference.weight;
  factors.push(preference);

  // Human Context Fit (only if human context provided)
  if (hasHumanContext && weights.humanContextFit) {
    const humanContextFit = calculateHumanContextFit(model, context.humanContext);
    if (humanContextFit) {
      humanContextFit.weight = weights.humanContextFit;
      humanContextFit.weightedScore = humanContextFit.score * humanContextFit.weight;
      factors.push(humanContextFit);
    }
  }

  // Calculate composite score
  const compositeScore = factors.reduce((sum, f) => sum + f.weightedScore, 0);

  return {
    model,
    factors,
    compositeScore,
  };
}

// Score all models and sort by score, with anti-monopoly diversity enforcement
export function scoreAllModels(context: ScoringContext): ModelScore[] {
  const scores = context.allModels.map((model) => scoreModel(model, context));

  // Sort by composite score descending
  scores.sort((a, b) => b.compositeScore - a.compositeScore);

  // Apply anti-monopoly diversity enforcement on backup suggestions
  return enforceProviderDiversity(scores);
}

// Anti-monopoly: ensure backup models show diverse providers when margins are small
function enforceProviderDiversity(scores: ModelScore[]): ModelScore[] {
  if (scores.length < 3) return scores;

  const top3 = scores.slice(0, 3);
  const top3Providers = top3.map(s => s.model.provider);

  // Check if all top 3 are from the same provider
  const allSameProvider = top3Providers[0] === top3Providers[1] && top3Providers[1] === top3Providers[2];

  if (!allSameProvider) return scores; // Already diverse

  const primaryProvider = top3Providers[0]!;

  // Find the best model from a different provider
  const bestOtherProvider = scores.find(s => s.model.provider !== primaryProvider);
  if (!bestOtherProvider) return scores; // No other providers available

  // Only swap if the margin is small enough (< 0.06) - don't sacrifice quality
  const margin = top3[2]!.compositeScore - bestOtherProvider.compositeScore;
  if (margin > 0.06) return scores; // Margin too large, the same-provider models are genuinely better

  // Swap #3 with the best alternative provider model
  const altIndex = scores.indexOf(bestOtherProvider);
  const result = [...scores];
  result[2] = bestOtherProvider;
  result[altIndex] = top3[2]!;

  return result;
}

// Quick scoring for fast-path (pure modality)
export function quickScoreForModality(
  models: ModelDefinition[],
  modalityType: 'vision' | 'audio'
): ModelScore[] {
  const scoreKey = modalityType === 'vision' ? 'visionScore' : 'audioScore';

  const scores: ModelScore[] = models
    .filter((m) => m.capabilities[scoreKey] > 0)
    .map((model) => ({
      model,
      factors: [
        {
          name: 'Modality Capability',
          score: model.capabilities[scoreKey],
          weight: 1.0,
          weightedScore: model.capabilities[scoreKey],
          detail: `${Math.round(model.capabilities[scoreKey] * 100)}% ${modalityType} processing capability`,
        },
      ],
      compositeScore: model.capabilities[scoreKey],
    }));

  scores.sort((a, b) => b.compositeScore - a.compositeScore);
  return scores;
}

// Combined modality scoring (60% modality, 40% text analysis)
export function scoreCombinedModality(
  textScores: ModelScore[],
  modalityScores: ModelScore[]
): ModelScore[] {
  // Create a map for quick lookup
  const textScoreMap = new Map(textScores.map((s) => [s.model.id, s]));

  const combinedScores: ModelScore[] = [];

  // Find models that exist in both
  for (const modalityScore of modalityScores) {
    const textScore = textScoreMap.get(modalityScore.model.id);
    if (!textScore) continue;

    // 60% modality, 40% text
    const combinedComposite =
      modalityScore.compositeScore * 0.6 + textScore.compositeScore * 0.4;

    // Merge factors with adjusted weights
    const combinedFactors: FactorScore[] = [
      ...modalityScore.factors.map((f) => ({
        ...f,
        weight: f.weight * 0.6,
        weightedScore: f.weightedScore * 0.6,
      })),
      ...textScore.factors.map((f) => ({
        ...f,
        weight: f.weight * 0.4,
        weightedScore: f.weightedScore * 0.4,
      })),
    ];

    combinedScores.push({
      model: modalityScore.model,
      factors: combinedFactors,
      compositeScore: combinedComposite,
    });
  }

  // Sort by combined score
  combinedScores.sort((a, b) => b.compositeScore - a.compositeScore);

  return combinedScores;
}
