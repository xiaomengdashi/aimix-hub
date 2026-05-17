const LAST_THREAD_KEY_PREFIX = "claude-clone:last-thread:";

export function getLastActiveThreadId(userId: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(`${LAST_THREAD_KEY_PREFIX}${userId}`) ?? undefined;
}

export function setLastActiveThreadId(
  userId: string,
  threadId: string | undefined,
): void {
  if (typeof window === "undefined") return;
  const key = `${LAST_THREAD_KEY_PREFIX}${userId}`;
  if (!threadId) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, threadId);
}
