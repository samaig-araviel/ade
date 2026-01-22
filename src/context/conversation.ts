import { getConversationContext, updateConversationContext } from '@/lib/kv';

// Conversation state that can be retrieved
export interface ConversationState {
  previousModelUsed: string | null;
  messageCount: number;
  topics: string[];
}

// Get conversation state
export async function getConversationState(
  conversationId: string
): Promise<ConversationState | null> {
  const context = await getConversationContext(conversationId);
  if (!context) return null;

  return {
    previousModelUsed: context.previousModelUsed,
    messageCount: context.messageCount,
    topics: context.topics,
  };
}

// Record a message in the conversation
export async function recordMessage(
  conversationId: string,
  modelUsed: string,
  topics: string[] = []
): Promise<void> {
  await updateConversationContext(conversationId, modelUsed, topics);
}

// Get the previously used model for a conversation
export async function getPreviousModel(
  conversationId: string
): Promise<string | null> {
  const state = await getConversationState(conversationId);
  return state?.previousModelUsed ?? null;
}

// Get message count for a conversation
export async function getMessageCount(
  conversationId: string
): Promise<number> {
  const state = await getConversationState(conversationId);
  return state?.messageCount ?? 0;
}
