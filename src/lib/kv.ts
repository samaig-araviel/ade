import { kv } from '@vercel/kv';
import { StoredDecision, FeedbackSignal } from '@/types';

// Key prefixes for different data types
const KEYS = {
  user: (userId: string) => `user:${userId}`,
  conversation: (conversationId: string) => `conv:${conversationId}`,
  decision: (decisionId: string) => `decision:${decisionId}`,
} as const;

// User context stored in KV
interface UserKVData {
  preferredModels: string[];
  avoidModels: string[];
  feedbackHistory: Array<{
    decisionId: string;
    signal: FeedbackSignal;
    timestamp: string;
  }>;
  lastUpdated: string;
}

// Conversation context stored in KV
interface ConversationKVData {
  previousModelUsed: string | null;
  messageCount: number;
  topics: string[];
  lastUpdated: string;
}

// Check if KV is available
async function isKVAvailable(): Promise<boolean> {
  try {
    await kv.ping();
    return true;
  } catch {
    return false;
  }
}

// Get user context
export async function getUserContext(userId: string): Promise<UserKVData | null> {
  try {
    const data = await kv.get<UserKVData>(KEYS.user(userId));
    return data;
  } catch (error) {
    console.warn('Failed to get user context:', error);
    return null;
  }
}

// Set user context
export async function setUserContext(
  userId: string,
  data: Partial<UserKVData>
): Promise<void> {
  try {
    const existing = await getUserContext(userId);
    const updated: UserKVData = {
      preferredModels: data.preferredModels ?? existing?.preferredModels ?? [],
      avoidModels: data.avoidModels ?? existing?.avoidModels ?? [],
      feedbackHistory: data.feedbackHistory ?? existing?.feedbackHistory ?? [],
      lastUpdated: new Date().toISOString(),
    };
    await kv.set(KEYS.user(userId), updated);
  } catch (error) {
    console.warn('Failed to set user context:', error);
  }
}

// Get conversation context
export async function getConversationContext(
  conversationId: string
): Promise<ConversationKVData | null> {
  try {
    const data = await kv.get<ConversationKVData>(KEYS.conversation(conversationId));
    return data;
  } catch (error) {
    console.warn('Failed to get conversation context:', error);
    return null;
  }
}

// Update conversation context
export async function updateConversationContext(
  conversationId: string,
  modelUsed: string,
  topics: string[] = []
): Promise<void> {
  try {
    const existing = await getConversationContext(conversationId);
    const updated: ConversationKVData = {
      previousModelUsed: modelUsed,
      messageCount: (existing?.messageCount ?? 0) + 1,
      topics: [...new Set([...(existing?.topics ?? []), ...topics])].slice(-10),
      lastUpdated: new Date().toISOString(),
    };
    await kv.set(KEYS.conversation(conversationId), updated);
  } catch (error) {
    console.warn('Failed to update conversation context:', error);
  }
}

// Store a decision
export async function storeDecision(decision: StoredDecision): Promise<void> {
  try {
    await kv.set(KEYS.decision(decision.decisionId), decision);
    // Set TTL of 7 days for decision storage
    await kv.expire(KEYS.decision(decision.decisionId), 60 * 60 * 24 * 7);
  } catch (error) {
    console.warn('Failed to store decision:', error);
  }
}

// Get a stored decision
export async function getDecision(decisionId: string): Promise<StoredDecision | null> {
  try {
    const data = await kv.get<StoredDecision>(KEYS.decision(decisionId));
    return data;
  } catch (error) {
    console.warn('Failed to get decision:', error);
    return null;
  }
}

// Add feedback to a decision
export async function addFeedback(
  decisionId: string,
  signal: FeedbackSignal,
  comment?: string
): Promise<boolean> {
  try {
    const decision = await getDecision(decisionId);
    if (!decision) {
      return false;
    }

    decision.feedback = {
      signal,
      comment,
      timestamp: new Date().toISOString(),
    };

    await kv.set(KEYS.decision(decisionId), decision);
    return true;
  } catch (error) {
    console.warn('Failed to add feedback:', error);
    return false;
  }
}

// Export KV status checker
export { isKVAvailable };
