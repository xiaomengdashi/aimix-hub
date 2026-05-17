import type { ChatAiProvider } from "@/lib/chat-ai-provider";

const LAST_THREAD_KEY_PREFIX = "claude-clone:last-thread:";

function lastThreadKey(userId: string, provider: ChatAiProvider): string {
  return `${LAST_THREAD_KEY_PREFIX}${userId}:${provider}`;
}

export function getLastActiveThreadId(
  userId: string,
  provider: ChatAiProvider,
): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(lastThreadKey(userId, provider)) ?? undefined;
}

export function setLastActiveThreadId(
  userId: string,
  provider: ChatAiProvider,
  threadId: string | undefined,
): void {
  if (typeof window === "undefined") return;
  const key = lastThreadKey(userId, provider);
  if (!threadId) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, threadId);
}
