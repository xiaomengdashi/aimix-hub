import type { AppId } from "@/lib/chat/app-id";

export type ProviderUsageStat = {
  provider: AppId;
  threadCount: number;
  messageCount: number;
  inputTokens: number;
  outputTokens: number;
};

export type ModelUsageStat = {
  modelId: string;
  label: string;
  messageCount: number;
  inputTokens: number;
  outputTokens: number;
};

export type ActivityDayStat = {
  date: string;
  messageCount: number;
  threadCount: number;
};

export type ArchivedThreadSummary = {
  id: string;
  title: string | null;
  provider: AppId;
  lastMessageAt: string;
};

export type UserAccountStats = {
  overview: {
    totalThreads: number;
    activeThreads: number;
    archivedThreads: number;
    pinnedThreads: number;
    totalMessages: number;
    assistantMessages: number;
    inputTokens: number;
    outputTokens: number;
  };
  byProvider: ProviderUsageStat[];
  byModel: ModelUsageStat[];
  activity: ActivityDayStat[];
  archivedThreads: ArchivedThreadSummary[];
};
