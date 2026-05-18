import type { AppId } from "@/lib/chat/app-id";

const LAST_THREAD_KEY_PREFIX = "claude-clone:last-thread:";

function lastThreadKey(userId: string, appId: AppId): string {
  return `${LAST_THREAD_KEY_PREFIX}${userId}:${appId}`;
}

export function getLastActiveThreadId(
  userId: string,
  appId: AppId,
): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(lastThreadKey(userId, appId)) ?? undefined;
}

export function setLastActiveThreadId(
  userId: string,
  appId: AppId,
  threadId: string | undefined,
): void {
  if (typeof window === "undefined") return;
  const key = lastThreadKey(userId, appId);
  if (!threadId) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, threadId);
}
