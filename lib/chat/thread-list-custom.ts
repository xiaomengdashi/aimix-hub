export type ThreadListCustom = {
  isPinned?: boolean;
};

export function isThreadPinned(custom?: Record<string, unknown>): boolean {
  return custom?.isPinned === true;
}
