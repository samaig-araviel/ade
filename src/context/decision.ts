import { storeDecision, getDecision, addFeedback } from '@/lib/kv';
import { StoredDecision, RouteResponse, Modality, FeedbackSignal } from '@/types';

// Store a routing decision
export async function saveDecision(
  decisionId: string,
  prompt: string,
  modality: Modality,
  response: RouteResponse,
  hasContext: boolean = false,
  hasHumanContext: boolean = false,
  hasConstraints: boolean = false
): Promise<void> {
  const decision: StoredDecision = {
    decisionId,
    request: {
      prompt,
      modality,
      hasContext,
      hasHumanContext,
      hasConstraints,
    },
    response,
    timestamp: new Date().toISOString(),
  };

  await storeDecision(decision);
}

// Retrieve a decision by ID
export async function retrieveDecision(
  decisionId: string
): Promise<StoredDecision | null> {
  return getDecision(decisionId);
}

// Add feedback to a decision
export async function recordFeedback(
  decisionId: string,
  signal: FeedbackSignal,
  comment?: string
): Promise<boolean> {
  return addFeedback(decisionId, signal, comment);
}

// Check if a decision has feedback
export async function hasDecisionFeedback(
  decisionId: string
): Promise<boolean> {
  const decision = await getDecision(decisionId);
  return decision?.feedback !== undefined;
}
