import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_NAV_OPTIONS, type AppId } from "@/lib/chat/app-id";
import { getChatModel, getClientChatModels } from "@/lib/chat/models";
import { createClient } from "@/lib/supabase/server";
import {
  parseChatMessageUsage,
  parseImageSessionModel,
  parseImageSessionModelLabel,
} from "@/lib/account/parse-message-usage";
import type {
  ActivityDayStat,
  ArchivedThreadSummary,
  ModelUsageStat,
  ProviderUsageStat,
  UserAccountStats,
} from "@/lib/account/types";

const CHAT_MESSAGE_FORMAT = "ai-sdk/v6";
const IMAGE_MESSAGE_FORMAT = "image-studio-v1";
const ACTIVITY_DAYS = 14;

type ThreadRow = {
  id: string;
  title: string | null;
  provider: string;
  is_archived: boolean;
  is_pinned: boolean;
  last_message_at: string;
  created_at: string;
};

function isAppId(value: string): value is AppId {
  return APP_NAV_OPTIONS.some((option) => option.id === value);
}

function resolveProvider(value: string): AppId {
  return isAppId(value) ? value : "other";
}

function formatDayKey(iso: string): string {
  return iso.slice(0, 10);
}

function buildActivityMap(days: number): Map<string, ActivityDayStat> {
  const map = new Map<string, ActivityDayStat>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = formatDayKey(date.toISOString());
    map.set(key, { date: key, messageCount: 0, threadCount: 0 });
  }

  return map;
}

function resolveModelLabel(modelId: string): string {
  return getChatModel(modelId)?.name ?? getClientChatModels().find((m) => m.id === modelId)?.name ?? modelId;
}

function emptyProviderStats(): ProviderUsageStat[] {
  return APP_NAV_OPTIONS.map((option) => ({
    provider: option.id,
    threadCount: 0,
    messageCount: 0,
    inputTokens: 0,
    outputTokens: 0,
  }));
}

export async function fetchUserAccountStats(
  userId: string,
  supabaseClient?: SupabaseClient,
): Promise<UserAccountStats> {
  const supabase = supabaseClient ?? (await createClient());
  const activityMap = buildActivityMap(ACTIVITY_DAYS);
  const threadActivityDays = new Set<string>();

  const activitySince = new Date(
    Date.now() - ACTIVITY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    { data: threads, error: threadsError },
    { count: totalMessages, error: messageCountError },
    { data: activityMessages, error: activityError },
    { data: usageMessages, error: usageError },
    { data: imageMessages, error: imageError },
    { data: allMessageThreads, error: allMessagesError },
  ] = await Promise.all([
    supabase
      .from("threads")
      .select(
        "id, title, provider, is_archived, is_pinned, last_message_at, created_at",
      )
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("messages")
      .select("thread_id, created_at")
      .eq("user_id", userId)
      .gte("created_at", activitySince)
      .order("created_at", { ascending: true }),
    supabase
      .from("messages")
      .select("thread_id, content")
      .eq("user_id", userId)
      .eq("format", CHAT_MESSAGE_FORMAT),
    supabase
      .from("messages")
      .select("thread_id, content")
      .eq("user_id", userId)
      .eq("format", IMAGE_MESSAGE_FORMAT),
    supabase
      .from("messages")
      .select("thread_id")
      .eq("user_id", userId),
  ]);

  if (threadsError) throw threadsError;
  if (messageCountError) throw messageCountError;
  if (activityError) throw activityError;
  if (usageError) throw usageError;
  if (imageError) throw imageError;
  if (allMessagesError) throw allMessagesError;

  const threadRows = (threads ?? []) as ThreadRow[];
  const threadById = new Map(threadRows.map((thread) => [thread.id, thread]));

  const providerMap = new Map<AppId, ProviderUsageStat>(
    emptyProviderStats().map((stat) => [stat.provider, { ...stat }]),
  );
  const modelMap = new Map<string, ModelUsageStat>();

  for (const thread of threadRows) {
    const provider = resolveProvider(thread.provider);
    const stat = providerMap.get(provider);
    if (!stat) continue;
    stat.threadCount += 1;
  }

  let assistantMessages = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  const providerMessageCounts = new Map<AppId, number>();

  for (const row of activityMessages ?? []) {
    const dayKey = formatDayKey(row.created_at);
    const activity = activityMap.get(dayKey);
    if (activity) {
      activity.messageCount += 1;
      if (!threadActivityDays.has(`${dayKey}:${row.thread_id}`)) {
        threadActivityDays.add(`${dayKey}:${row.thread_id}`);
        activity.threadCount += 1;
      }
    }
  }

  for (const row of allMessageThreads ?? []) {
    const thread = threadById.get(row.thread_id);
    const provider = resolveProvider(thread?.provider ?? "other");
    providerMessageCounts.set(
      provider,
      (providerMessageCounts.get(provider) ?? 0) + 1,
    );
  }

  for (const row of usageMessages ?? []) {
    const thread = threadById.get(row.thread_id);
    const provider = resolveProvider(thread?.provider ?? "other");
    const usage = parseChatMessageUsage(row.content);
    if (!usage) continue;

    assistantMessages += 1;
    const input = usage.inputTokens ?? 0;
    const output = usage.outputTokens ?? 0;
    inputTokens += input;
    outputTokens += output;

    const providerStat = providerMap.get(provider);
    if (providerStat) {
      providerStat.inputTokens += input;
      providerStat.outputTokens += output;
    }
  }

  for (const row of imageMessages ?? []) {
    const modelId = parseImageSessionModel(row.content);
    if (!modelId) continue;
    const label =
      parseImageSessionModelLabel(row.content) ?? resolveModelLabel(modelId);
    const existing = modelMap.get(modelId) ?? {
      modelId,
      label,
      messageCount: 0,
      inputTokens: 0,
      outputTokens: 0,
    };
    existing.messageCount += 1;
    modelMap.set(modelId, existing);
  }

  for (const [provider, count] of providerMessageCounts) {
    const providerStat = providerMap.get(provider);
    if (providerStat) providerStat.messageCount = count;
  }

  const archivedThreads: ArchivedThreadSummary[] = threadRows
    .filter((thread) => thread.is_archived)
    .map((thread) => ({
      id: thread.id,
      title: thread.title,
      provider: resolveProvider(thread.provider),
      lastMessageAt: thread.last_message_at,
    }));

  const activeThreads = threadRows.filter((thread) => !thread.is_archived).length;
  const archivedThreadCount = archivedThreads.length;
  const pinnedThreads = threadRows.filter((thread) => thread.is_pinned).length;

  const byProvider = APP_NAV_OPTIONS.map(
    (option) => providerMap.get(option.id)!,
  ).filter((stat) => stat.threadCount > 0 || stat.messageCount > 0);

  const byModel = [...modelMap.values()].sort(
    (a, b) => b.messageCount - a.messageCount,
  );

  return {
    overview: {
      totalThreads: threadRows.length,
      activeThreads,
      archivedThreads: archivedThreadCount,
      pinnedThreads,
      totalMessages: totalMessages ?? 0,
      assistantMessages,
      inputTokens,
      outputTokens,
    },
    byProvider,
    byModel,
    activity: [...activityMap.values()],
    archivedThreads,
  };
}
