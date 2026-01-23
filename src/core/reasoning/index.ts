import {
  ModelScore,
  ModelReasoning,
  ReasoningFactor,
  FactorScore,
  FactorImpact,
  QueryAnalysis,
} from '@/types';

// Thresholds for impact classification
const POSITIVE_THRESHOLD = 0.7;
const NEGATIVE_THRESHOLD = 0.4;

// Get impact classification for a score
function getImpact(score: number): FactorImpact {
  if (score >= POSITIVE_THRESHOLD) return FactorImpact.Positive;
  if (score <= NEGATIVE_THRESHOLD) return FactorImpact.Negative;
  return FactorImpact.Neutral;
}

// Convert factor score to reasoning factor
function toReasoningFactor(factor: FactorScore): ReasoningFactor {
  return {
    name: factor.name,
    impact: getImpact(factor.score),
    weight: factor.weight,
    detail: factor.detail,
  };
}

// Generate summary for primary model
function generatePrimarySummary(
  modelScore: ModelScore,
  analysis: QueryAnalysis
): string {
  const factors = modelScore.factors;
  const model = modelScore.model;

  // Find top positive factors (sorted by weighted score)
  const positiveFactors = factors
    .filter((f) => f.score >= POSITIVE_THRESHOLD)
    .sort((a, b) => b.weightedScore - a.weightedScore);

  // Find any notable weaknesses
  const weaknesses = factors.filter((f) => f.score < NEGATIVE_THRESHOLD);

  // Get the strongest factor
  const strongest = positiveFactors[0];
  const secondStrong = positiveFactors[1];

  // Build summary dynamically
  const parts: string[] = [];

  // Strong opening based on top factor
  if (strongest) {
    const strongestScore = Math.round(strongest.score * 100);

    switch (strongest.name) {
      case 'Task Fitness':
        if (strongestScore >= 90) {
          parts.push(`${model.name} excels at ${analysis.intent} tasks`);
        } else {
          parts.push(`${model.name} handles ${analysis.intent} requests really well`);
        }
        break;

      case 'Modality Fitness':
        parts.push(`${model.name} has excellent ${analysis.modality} processing capabilities`);
        break;

      case 'Cost Efficiency':
        parts.push(`${model.name} offers great value for this request`);
        break;

      case 'Speed':
        parts.push(`${model.name} will respond quickly`);
        break;

      case 'Conversation Coherence':
        parts.push(`${model.name} maintains your conversation flow`);
        break;

      case 'Human Context Fit':
        parts.push(`${model.name} is well-suited for your current context`);
        break;

      default:
        parts.push(`${model.name} is a strong choice for this request`);
    }
  } else {
    parts.push(`${model.name} is the best available option for this request`);
  }

  // Add secondary strength if notable
  if (secondStrong && secondStrong.score >= 0.8) {
    switch (secondStrong.name) {
      case 'Task Fitness':
        parts.push(`with solid ${analysis.domain} domain knowledge`);
        break;
      case 'Speed':
        parts.push('and responds quickly');
        break;
      case 'Cost Efficiency':
        parts.push('at a reasonable cost');
        break;
      case 'Human Context Fit':
        parts.push('and fits your personal context well');
        break;
      default:
        break;
    }
  }

  // Acknowledge trade-off if there's a weakness
  if (weaknesses.length > 0) {
    const weakness = weaknesses[0]!;
    if (weakness.name === 'Cost Efficiency') {
      parts.push('— it is on the pricier side');
    } else if (weakness.name === 'Speed') {
      parts.push('— responses may take a moment');
    }
  }

  return parts.join(' ') + '.';
}

// Generate summary for backup model
function generateBackupSummary(
  modelScore: ModelScore,
  analysis: QueryAnalysis,
  rank: number
): string {
  const model = modelScore.model;
  const factors = modelScore.factors;
  const score = modelScore.compositeScore;

  // Find this model's strengths
  const strengths = factors
    .filter((f) => f.score >= POSITIVE_THRESHOLD)
    .sort((a, b) => b.weightedScore - a.weightedScore);

  const topStrength = strengths[0];

  // Vary opening based on rank and score
  let opening: string;
  if (rank === 1) {
    if (score >= 0.8) {
      opening = `${model.name} is a strong alternative`;
    } else {
      opening = `${model.name} is a solid backup option`;
    }
  } else {
    if (score >= 0.75) {
      opening = `${model.name} is another good choice`;
    } else {
      opening = `${model.name} could also work`;
    }
  }

  // Add reason based on strength
  if (topStrength) {
    switch (topStrength.name) {
      case 'Task Fitness':
        return `${opening} with good ${analysis.intent} capabilities.`;
      case 'Cost Efficiency':
        return `${opening} — more budget-friendly while still capable.`;
      case 'Speed':
        return `${opening} if you need faster responses.`;
      case 'Modality Fitness':
        return `${opening} with strong ${analysis.modality} support.`;
      case 'Human Context Fit':
        return `${opening} that matches your current context.`;
      default:
        return `${opening} for this type of request.`;
    }
  }

  return `${opening} for this request.`;
}

// Generate complete reasoning for a model
export function generateReasoning(
  modelScore: ModelScore,
  analysis: QueryAnalysis,
  isPrimary: boolean,
  backupRank?: number
): ModelReasoning {
  // Generate summary
  const summary = isPrimary
    ? generatePrimarySummary(modelScore, analysis)
    : generateBackupSummary(modelScore, analysis, backupRank ?? 1);

  // Convert factors to reasoning factors
  const factors = modelScore.factors.map(toReasoningFactor);

  return {
    summary,
    factors,
  };
}

// Generate reasoning for fast-path selection
export function generateFastPathReasoning(
  modelScore: ModelScore,
  modalityType: 'vision' | 'audio'
): ModelReasoning {
  const model = modelScore.model;
  const score = Math.round(modelScore.compositeScore * 100);

  const modalityName = modalityType === 'vision' ? 'image' : 'audio';

  const summary = `${model.name} was selected for its excellent ${modalityName} processing capabilities (${score}% capability score).`;

  const factors: ReasoningFactor[] = [
    {
      name: 'Modality Capability',
      impact: FactorImpact.Positive,
      weight: 1.0,
      detail: `Top-tier ${modalityType} processing with ${score}% capability`,
    },
  ];

  return {
    summary,
    factors,
  };
}

// Generate reasoning for fallback selection
export function generateFallbackReasoning(model: ModelScore['model']): ModelReasoning {
  return {
    summary: `${model.name} was selected as a general-purpose fallback since the requested constraints eliminated preferred options.`,
    factors: [
      {
        name: 'Fallback Selection',
        impact: FactorImpact.Neutral,
        weight: 1.0,
        detail: 'Selected as most capable general model when constraints limited options',
      },
    ],
  };
}

// Generate reasoning when reconciling combined modality
export function generateReconciledReasoning(
  modelScore: ModelScore,
  _analysis: QueryAnalysis,
  modalityType: 'vision' | 'audio'
): ModelReasoning {
  const model = modelScore.model;
  const modalityName = modalityType === 'vision' ? 'image' : 'audio';

  // Find modality and text factors
  const modalityFactor = modelScore.factors.find((f) =>
    f.name.includes('Modality')
  );
  const taskFactor = modelScore.factors.find((f) =>
    f.name.includes('Task')
  );

  let summary: string;
  if (modalityFactor && taskFactor && modalityFactor.score >= 0.8 && taskFactor.score >= 0.7) {
    summary = `${model.name} balances strong ${modalityName} processing with good text analysis capabilities — ideal for your combined request.`;
  } else if (modalityFactor && modalityFactor.score >= 0.85) {
    summary = `${model.name} excels at ${modalityName} processing, which takes priority for your request, while handling the text portion well.`;
  } else {
    summary = `${model.name} provides the best balance of ${modalityName} and text capabilities for this combined request.`;
  }

  const factors = modelScore.factors.map(toReasoningFactor);

  return {
    summary,
    factors,
  };
}
