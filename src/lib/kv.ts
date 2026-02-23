import { StoredDecision, FeedbackSignal } from '@/types';

// In-memory storage (replaces Vercel KV - no external dependencies needed)
const memoryStore = new Map<string, unknown>();
const expiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Key prefixes for different data types
const KEYS = {
  user: (userId: string) => `user:${userId}`,
  conversation: (conversationId: string) => `conv:${conversationId}`,
  decision: (decisionId: string) => `decision:${decisionId}`,
} as const;

// User context stored in memory
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

// Conversation context stored in memory
interface ConversationKVData {
  previousModelUsed: string | null;
  messageCount: number;
  topics: string[];
  lastUpdated: string;
}

// In-memory store is always available
async function isKVAvailable(): Promise<boolean> {
  return true;
}

// Get user context
export async function getUserContext(userId: string): Promise<UserKVData | null> {
  try {
    const data = memoryStore.get(KEYS.user(userId)) as UserKVData | undefined;
    return data ?? null;
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
    memoryStore.set(KEYS.user(userId), updated);
  } catch (error) {
    console.warn('Failed to set user context:', error);
  }
}

// Get conversation context
export async function getConversationContext(
  conversationId: string
): Promise<ConversationKVData | null> {
  try {
    const data = memoryStore.get(KEYS.conversation(conversationId)) as ConversationKVData | undefined;
    return data ?? null;
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
    memoryStore.set(KEYS.conversation(conversationId), updated);
  } catch (error) {
    console.warn('Failed to update conversation context:', error);
  }
}

// Store a decision
export async function storeDecision(decision: StoredDecision): Promise<void> {
  try {
    const key = KEYS.decision(decision.decisionId);
    memoryStore.set(key, decision);

    // Set TTL of 7 days - clear any existing timer first
    const existingTimer = expiryTimers.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      memoryStore.delete(key);
      expiryTimers.delete(key);
    }, 60 * 60 * 24 * 7 * 1000);
    expiryTimers.set(key, timer);
  } catch (error) {
    console.warn('Failed to store decision:', error);
  }
}

// Get a stored decision
export async function getDecision(decisionId: string): Promise<StoredDecision | null> {
  try {
    const data = memoryStore.get(KEYS.decision(decisionId)) as StoredDecision | undefined;
    return data ?? null;
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

    memoryStore.set(KEYS.decision(decisionId), decision);
    return true;
  } catch (error) {
    console.warn('Failed to add feedback:', error);
    return false;
  }
}

// Export status checker
export { isKVAvailable };
