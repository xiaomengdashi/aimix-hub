"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ExportedMessageRepository,
  ExportedMessageRepositoryItem,
  GenericThreadHistoryAdapter,
  MessageFormatAdapter,
  RemoteThreadInitializeResponse,
  RemoteThreadListAdapter,
  RemoteThreadListResponse,
  RemoteThreadMetadata,
  ThreadHistoryAdapter,
  ThreadMessage,
} from "@assistant-ui/core";
import { createAssistantStream } from "assistant-stream";
import { createElement, useMemo, type FC, type PropsWithChildren } from "react";
import { useAui } from "@assistant-ui/store";
import { RuntimeAdapterProvider } from "@assistant-ui/core/react";
import { createFormattedPersistence } from "@/lib/supabase/formatted-persistence";
import { SupabaseMessagePersistence } from "@/lib/supabase/message-persistence";
import type { ChatAiProvider } from "@/lib/chat/provider";
import { generateAITitle } from "@/lib/supabase/thread-title";

type ThreadRow = {
  id: string;
  title: string | null;
  is_archived: boolean;
  external_id: string | null;
  provider: ChatAiProvider;
};

class SupabaseHistoryAdapter implements ThreadHistoryAdapter {
  private readonly persistence: SupabaseMessagePersistence;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly aui: ReturnType<typeof useAui>,
  ) {
    this.persistence = new SupabaseMessagePersistence(supabase);
  }

  async load(): Promise<ExportedMessageRepository> {
    return { messages: [] };
  }

  async append(_item: ExportedMessageRepositoryItem): Promise<void> {
    // Persistence is handled through withFormat in useAISDKRuntime.
  }

  withFormat<TMessage, TStorageFormat extends Record<string, unknown>>(
    formatAdapter: MessageFormatAdapter<TMessage, TStorageFormat>,
  ): GenericThreadHistoryAdapter<TMessage> {
    const formatted = createFormattedPersistence(
      this.persistence,
      formatAdapter,
    );
    const adapter = this;

    return {
      async append(item) {
        const { remoteId } = await adapter.aui.threadListItem().initialize();
        await formatted.append(remoteId, item);
      },
      async update(item, localMessageId) {
        const remoteId = adapter.aui.threadListItem().getState().remoteId;
        if (!remoteId) return;
        await formatted.update?.(remoteId, item, localMessageId);
      },
      async load() {
        const remoteId = adapter.aui.threadListItem().getState().remoteId;
        if (!remoteId) return { messages: [] };
        return formatted.load(remoteId);
      },
    };
  }
}

const createHistoryProvider = (
  supabase: SupabaseClient,
): FC<PropsWithChildren> => {
  const Provider: FC<PropsWithChildren> = ({ children }) => {
    const aui = useAui();
    const history = useMemo(
      () => new SupabaseHistoryAdapter(supabase, aui),
      [aui],
    );
    const adapters = useMemo(() => ({ history }), [history]);

    return createElement(RuntimeAdapterProvider, { adapters, children });
  };
  return Provider;
};

export function createSupabaseThreadListAdapter(
  supabase: SupabaseClient,
  provider: ChatAiProvider,
): RemoteThreadListAdapter {
  const requireUserId = async (): Promise<string> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Not authenticated");
    return user.id;
  };

  const mapThread = (row: ThreadRow): RemoteThreadMetadata => ({
    remoteId: row.id,
    externalId: row.external_id ?? undefined,
    status: row.is_archived ? "archived" : "regular",
    title: row.title ?? undefined,
  });

  return {
    unstable_Provider: createHistoryProvider(supabase),

    async list(): Promise<RemoteThreadListResponse> {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("threads")
        .select("id, title, is_archived, external_id, provider")
        .eq("user_id", userId)
        .eq("provider", provider)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      return {
        threads: (data ?? []).map((row) => mapThread(row as ThreadRow)),
      };
    },

    async initialize(
      _threadId: string,
    ): Promise<RemoteThreadInitializeResponse> {
      const userId = await requireUserId();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("threads")
        .insert({
          user_id: userId,
          provider,
          last_message_at: now,
        })
        .select("id")
        .single();

      if (error) throw error;

      return { remoteId: data.id, externalId: undefined };
    },

    async rename(remoteId: string, newTitle: string): Promise<void> {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("threads")
        .update({ title: newTitle })
        .eq("id", remoteId)
        .eq("user_id", userId);
      if (error) throw error;
    },

    async archive(remoteId: string): Promise<void> {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("threads")
        .update({ is_archived: true })
        .eq("id", remoteId)
        .eq("user_id", userId);
      if (error) throw error;
    },

    async unarchive(remoteId: string): Promise<void> {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("threads")
        .update({ is_archived: false })
        .eq("id", remoteId)
        .eq("user_id", userId);
      if (error) throw error;
    },

    async delete(remoteId: string): Promise<void> {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("threads")
        .delete()
        .eq("id", remoteId)
        .eq("user_id", userId);
      if (error) throw error;
    },

    async fetch(threadId: string): Promise<RemoteThreadMetadata> {
      const userId = await requireUserId();
      const { data, error } = await supabase
        .from("threads")
        .select("id, title, is_archived, external_id, provider")
        .eq("id", threadId)
        .eq("user_id", userId)
        .eq("provider", provider)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Thread not found");

      return mapThread(data as ThreadRow);
    },

    async generateTitle(
      remoteId: string,
      messages: readonly ThreadMessage[],
    ) {
      const title = await generateAITitle(messages);
      if (title) {
        const userId = await requireUserId();
        await supabase
          .from("threads")
          .update({ title })
          .eq("id", remoteId)
          .eq("user_id", userId);
      }
      return createAssistantStream((controller) => {
        if (title) controller.appendText(title);
      });
    },
  };
}
