const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export function formatRelativeConversationTime(
  iso: string | undefined,
): string | null {
  if (!iso) return null;

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const diffMs = Math.max(0, Date.now() - then);

  if (diffMs < ONE_HOUR_MS) {
    const minutes = Math.max(1, Math.floor(diffMs / ONE_MINUTE_MS));
    return `${minutes} 分钟前`;
  }

  if (diffMs < ONE_DAY_MS) {
    const hours = Math.max(1, Math.floor(diffMs / ONE_HOUR_MS));
    return `${hours} 小时前`;
  }

  const days = Math.max(1, Math.floor(diffMs / ONE_DAY_MS));
  return `${days} 天前`;
}
