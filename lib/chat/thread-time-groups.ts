import { getThreadLastMessageAt } from "@/lib/chat/thread-list-custom";

export const THREAD_TIME_GROUP_LABELS = [
  "一天内",
  "一周内",
  "一个月内",
  "一年内",
  "一年前",
] as const;

export type ThreadTimeGroupLabel = (typeof THREAD_TIME_GROUP_LABELS)[number];

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

export type ThreadTimeGroupSource = {
  lastMessageAt?: Date | undefined;
  custom?: Record<string, unknown> | undefined;
};

export function resolveThreadActivityTime(
  item: ThreadTimeGroupSource | undefined,
): number | undefined {
  if (!item) return undefined;
  if (item.lastMessageAt instanceof Date) {
    const time = item.lastMessageAt.getTime();
    return Number.isNaN(time) ? undefined : time;
  }
  const fromCustom = getThreadLastMessageAt(item.custom);
  if (!fromCustom) return undefined;
  const time = new Date(fromCustom).getTime();
  return Number.isNaN(time) ? undefined : time;
}

export function threadTimeGroupLabel(
  at: number | undefined,
  now = Date.now(),
): ThreadTimeGroupLabel {
  if (at == null) return "一天内";
  const age = Math.max(0, now - at);
  if (age < DAY_MS) return "一天内";
  if (age < WEEK_MS) return "一周内";
  if (age < MONTH_MS) return "一个月内";
  if (age < YEAR_MS) return "一年内";
  return "一年前";
}

export type ThreadTimeGroup = {
  label: ThreadTimeGroupLabel;
  indices: number[];
};

export function groupThreadIndicesByTime(
  itemsByIndex: Array<ThreadTimeGroupSource | undefined>,
  now = Date.now(),
): ThreadTimeGroup[] {
  const buckets: Record<ThreadTimeGroupLabel, number[]> = {
    一天内: [],
    一周内: [],
    一个月内: [],
    一年内: [],
    一年前: [],
  };

  for (let index = 0; index < itemsByIndex.length; index += 1) {
    const label = threadTimeGroupLabel(
      resolveThreadActivityTime(itemsByIndex[index]),
      now,
    );
    buckets[label].push(index);
  }

  return THREAD_TIME_GROUP_LABELS.filter(
    (label) => buckets[label].length > 0,
  ).map((label) => ({ label, indices: buckets[label] }));
}
