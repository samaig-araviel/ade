import { getUserContext, setUserContext } from '@/lib/kv';
import { FeedbackSignal } from '@/types';

// User preferences that can be stored
export interface UserPreferencesData {
  preferredModels: string[];
  avoidModels: string[];
}

// Get user preferences
export async function getUserPreferences(userId: string): Promise<UserPreferencesData | null> {
  const context = await getUserContext(userId);
  if (!context) return null;

  return {
    preferredModels: context.preferredModels,
    avoidModels: context.avoidModels,
  };
}

// Update user preferences
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferencesData>
): Promise<void> {
  await setUserContext(userId, preferences);
}

// Add feedback to user history
export async function addUserFeedback(
  userId: string,
  decisionId: string,
  signal: FeedbackSignal
): Promise<void> {
  const context = await getUserContext(userId);
  const feedbackHistory = context?.feedbackHistory ?? [];

  feedbackHistory.push({
    decisionId,
    signal,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 100 feedback entries
  const trimmedHistory = feedbackHistory.slice(-100);

  await setUserContext(userId, { feedbackHistory: trimmedHistory });
}

// Get user feedback history
export async function getUserFeedbackHistory(
  userId: string
): Promise<Array<{ decisionId: string; signal: FeedbackSignal; timestamp: string }>> {
  const context = await getUserContext(userId);
  return context?.feedbackHistory ?? [];
}
