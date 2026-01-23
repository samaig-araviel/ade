import { ModelScore, ModelDefinition } from '@/types';
import { clamp } from '@/lib/helpers';

// Selection result
export interface SelectionResult {
  primary: ModelScore;
  backups: ModelScore[];
  confidence: number;
}

// Select primary and backup models from scored list
export function selectModels(scoredModels: ModelScore[]): SelectionResult {
  if (scoredModels.length === 0) {
    throw new Error('No models available for selection');
  }

  // Models are already sorted by score descending
  const primary = scoredModels[0]!;
  const backups = scoredModels.slice(1, 3); // Up to 2 backups

  // Calculate confidence based on margin
  const confidence = calculateConfidence(scoredModels);

  return {
    primary,
    backups,
    confidence,
  };
}

// Calculate confidence based on score margins
function calculateConfidence(scoredModels: ModelScore[]): number {
  if (scoredModels.length === 1) {
    return 0.95; // Single model = high confidence (only option)
  }

  const firstScore = scoredModels[0]!.compositeScore;
  const secondScore = scoredModels[1]!.compositeScore;

  // Calculate margin between first and second
  const margin = firstScore - secondScore;

  // Map margin to confidence:
  // margin >= 0.2 -> confidence ~0.95
  // margin = 0.1 -> confidence ~0.80
  // margin = 0.05 -> confidence ~0.70
  // margin = 0 -> confidence ~0.60

  // Using a smooth sigmoid-like function
  const baseConfidence = 0.6;
  const maxBoost = 0.35;

  // Sigmoid mapping: margin of 0.1 = ~0.5 of max boost
  const normalizedMargin = clamp(margin / 0.2, 0, 1);
  const boost = maxBoost * (1 - Math.exp(-5 * normalizedMargin));

  return clamp(baseConfidence + boost, 0.5, 0.98);
}

// Fallback selection when constraints eliminate all models
export function selectFallback(allModels: ModelDefinition[]): ModelDefinition | null {
  if (allModels.length === 0) return null;

  // Find the most generally capable model (highest average task strength)
  let bestModel = allModels[0]!;
  let bestAvgScore = 0;

  for (const model of allModels) {
    const intentScores = Object.values(model.taskStrengths.intents);
    const domainScores = Object.values(model.taskStrengths.domains);
    const allScores = [...intentScores, ...domainScores];
    const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

    if (avgScore > bestAvgScore) {
      bestAvgScore = avgScore;
      bestModel = model;
    }
  }

  return bestModel;
}

// Check if selection needs reconciliation (for combined modality)
export function needsReconciliation(
  textBest: ModelScore,
  modalityBest: ModelScore
): boolean {
  return textBest.model.id !== modalityBest.model.id;
}

// Reconcile text and modality scores for combined modality requests
export function reconcileScores(
  textScores: ModelScore[],
  modalityScores: ModelScore[],
  modalityWeight: number = 0.6
): ModelScore[] {
  const textWeight = 1 - modalityWeight;

  // Create lookup maps
  const textMap = new Map(textScores.map((s) => [s.model.id, s]));
  const modalityMap = new Map(modalityScores.map((s) => [s.model.id, s]));

  const reconciled: ModelScore[] = [];

  // Process all models that have both scores
  for (const [modelId, modalityScore] of modalityMap) {
    const textScore = textMap.get(modelId);
    if (!textScore) continue;

    const combinedScore =
      modalityScore.compositeScore * modalityWeight +
      textScore.compositeScore * textWeight;

    // Combine factors
    const factors = [
      ...modalityScore.factors.map((f) => ({
        ...f,
        name: `[Modality] ${f.name}`,
        weight: f.weight * modalityWeight,
        weightedScore: f.weightedScore * modalityWeight,
      })),
      ...textScore.factors.map((f) => ({
        ...f,
        name: `[Text] ${f.name}`,
        weight: f.weight * textWeight,
        weightedScore: f.weightedScore * textWeight,
      })),
    ];

    reconciled.push({
      model: modalityScore.model,
      factors,
      compositeScore: combinedScore,
    });
  }

  // Sort by combined score
  reconciled.sort((a, b) => b.compositeScore - a.compositeScore);

  return reconciled;
}

// Edge case handling for combined modality
export function handleCombinedModalityEdgeCases(
  textScores: ModelScore[],
  modalityScores: ModelScore[]
): { shouldPreferModality: boolean; shouldPreferText: boolean } {
  if (textScores.length === 0 || modalityScores.length === 0) {
    return { shouldPreferModality: false, shouldPreferText: false };
  }

  const modalityBest = modalityScores[0]!;
  const textBest = textScores[0]!;

  // If modality-best scores above 0.7 on text analysis, prefer it
  const modalityBestTextScore = textScores.find(
    (s) => s.model.id === modalityBest.model.id
  )?.compositeScore ?? 0;

  // If text-best has above 0.8 modality capability, consider it
  const textBestModalityScore = modalityScores.find(
    (s) => s.model.id === textBest.model.id
  )?.compositeScore ?? 0;

  return {
    shouldPreferModality: modalityBestTextScore >= 0.7,
    shouldPreferText: textBestModalityScore >= 0.8,
  };
}
