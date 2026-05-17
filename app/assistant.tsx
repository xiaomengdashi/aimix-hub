"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import type { RemoteThreadListAdapter } from "@assistant-ui/core";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type FC } from "react";
import { ChatActiveThreadTracker } from "@/components/assistant-ui/shell/chat-active-thread-tracker";
import { ChatThreadListOrderSync } from "@/components/assistant-ui/shell/chat-thread-list-order-sync";
import { ChatModeProvider } from "@/components/assistant-ui/contexts/chat-mode-context";
import { ChatModelProvider } from "@/components/assistant-ui/contexts/chat-model-context";
import { ComposerToolProvider } from "@/components/assistant-ui/contexts/composer-tool-context";
import { ChatSessionProvider } from "@/components/assistant-ui/contexts/chat-session-context";
import {
  ChatAiProviderProvider,
  useChatAiProvider,
} from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { getProviderUI } from "@/components/assistant-ui/providers/registry";
import { type ChatAiProvider } from "@/lib/chat/provider";
import { useStableChatRuntime } from "@/hooks/use-stable-chat-runtime";
import { getLastActiveThreadId } from "@/lib/chat/session-storage";
import { chatTransport } from "@/lib/chat/transport";
import { createClient } from "@/lib/supabase/client";
import { getDisplayUsername } from "@/lib/auth/username";
import { createSupabaseThreadListAdapter } from "@/lib/supabase/thread-adapter";

const ChatShellContent: FC<{
  userId: string;
  threadListAdapter: RemoteThreadListAdapter;
  initialThreadId?: string;
  displayUsername: string;
  provider: ChatAiProvider;
}> = ({
  userId,
  threadListAdapter,
  initialThreadId,
  displayUsername,
  provider,
}) => {
  const [chatError, setChatError] = useState<string | null>(null);
  const { Layout, Thread } = getProviderUI(provider);

  const runtime = useStableChatRuntime({
    threadListAdapter,
    initialThreadId,
    transport: chatTransport,
    onError: (error) => {
      setChatError(error.message || "发送失败，请稍后重试");
    },
    onFinish: () => {
      setChatError(null);
    },
  });

  return (
    <ChatModeProvider>
      <ChatModelProvider uiProvider={provider}>
        <ComposerToolProvider uiProvider={provider}>
          <ChatSessionProvider
            onComposerSubmit={() => setChatError(null)}
            onAttachmentError={(message) => setChatError(message)}
          >
            <AssistantRuntimeProvider runtime={runtime}>
              <ChatActiveThreadTracker userId={userId} provider={provider} />
              <ChatThreadListOrderSync />
              <Layout displayUsername={displayUsername} chatError={chatError}>
                <Thread />
              </Layout>
            </AssistantRuntimeProvider>
          </ChatSessionProvider>
        </ComposerToolProvider>
      </ChatModelProvider>
    </ChatModeProvider>
  );
};

const ChatShellInner: FC<{
  userId: string;
  displayUsername: string;
}> = ({ userId, displayUsername }) => {
  const { provider } = useChatAiProvider();
  const supabase = useMemo(() => createClient(), []);

  const threadListAdapter = useMemo(
    () => createSupabaseThreadListAdapter(supabase, provider),
    [supabase, provider],
  );

  return (
    <ChatShellContent
      key={provider}
      userId={userId}
      threadListAdapter={threadListAdapter}
      initialThreadId={getLastActiveThreadId(userId, provider)}
      displayUsername={displayUsername}
      provider={provider}
    />
  );
};

const ChatShell: FC<{
  userId: string;
  displayUsername: string;
  initialProvider: ChatAiProvider;
}> = ({ initialProvider, ...props }) => (
  <ChatAiProviderProvider initialProvider={initialProvider}>
    <ChatShellInner {...props} />
  </ChatAiProviderProvider>
);

export const Assistant: FC<{ initialProvider: ChatAiProvider }> = ({
  initialProvider,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!authReady) {
    return (
      <div className="flex h-dvh items-center justify-center text-muted-foreground text-sm">
        加载中…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ChatShell
      userId={user.id}
      displayUsername={getDisplayUsername(user)}
      initialProvider={initialProvider}
    />
  );
};
