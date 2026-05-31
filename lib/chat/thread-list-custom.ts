export type ThreadListCustom = {
  isPinned?: boolean;
  lastMessageAt?: string;
};

export function isThreadPinned(custom?: Record<string, unknown>): boolean {
  return custom?.isPinned === true;
}

export function getThreadLastMessageAt(
  custom?: Record<string, unknown>,
): string | undefined {
  const value = custom?.lastMessageAt;
  return typeof value === "string" ? value : undefined;
}
