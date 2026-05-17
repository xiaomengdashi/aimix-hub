"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import type { RemoteThreadListAdapter } from "@assistant-ui/core";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type FC } from "react";
import { ChatActiveThreadTracker } from "@/components/assistant-ui/chat-active-thread-tracker";
import { ChatThreadListOrderSync } from "@/components/assistant-ui/chat-thread-list-order-sync";
import { ChatModeProvider } from "@/components/assistant-ui/chat-mode-context";
import { ChatModelProvider } from "@/components/assistant-ui/chat-model-context";
import { ChatSessionProvider } from "@/components/assistant-ui/chat-session-context";
import { ChatUiThemeProvider, useChatUiTheme } from "@/components/assistant-ui/chat-ui-theme-context";
import { Claude } from "@/components/assistant-ui/claude";
import { ClaudeChatLayout } from "@/components/assistant-ui/claude-chat-layout";
import { Thread } from "@/components/assistant-ui/thread";
import { ContextUsageIndicator } from "@/components/assistant-ui/context-usage-indicator";
import { ModelPicker } from "@/components/assistant-ui/model-picker";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useStableChatRuntime } from "@/hooks/use-stable-chat-runtime";
import { getLastActiveThreadId } from "@/lib/chat-session-storage";
import { chatTransport } from "@/lib/chat-transport";
import { createClient } from "@/lib/supabase/client";
import { UserMenu } from "@/components/auth/user-menu";
import { getDisplayUsername } from "@/lib/auth/username";
import { createSupabaseThreadListAdapter } from "@/lib/supabase-thread-adapter";

const ChatShellContent: FC<{
  userId: string;
  threadListAdapter: RemoteThreadListAdapter;
  initialThreadId?: string;
  displayUsername: string;
}> = ({ userId, threadListAdapter, initialThreadId, displayUsername }) => {
  const { theme } = useChatUiTheme();
  const [chatError, setChatError] = useState<string | null>(null);

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
      <ChatModelProvider>
        <ChatSessionProvider
          onComposerSubmit={() => setChatError(null)}
          onAttachmentError={(message) => setChatError(message)}
        >
        <AssistantRuntimeProvider runtime={runtime}>
          <ChatActiveThreadTracker userId={userId} />
          <ChatThreadListOrderSync />
          {theme === "claude" ? (
            <ClaudeChatLayout
              displayUsername={displayUsername}
              chatError={chatError}
            >
              <Claude />
            </ClaudeChatLayout>
          ) : (
            <SidebarProvider>
              <div className="flex h-dvh w-full pr-0.5">
                <ThreadListSidebar />
                <SidebarInset>
                  <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <ModelPicker />
                    <ContextUsageIndicator
                      variant="shadcn"
                      className="ms-auto hidden min-w-0 max-w-xs md:flex"
                    />
                    <UserMenu displayName={displayUsername} />
                  </header>
                  {chatError ? (
                    <div
                      role="alert"
                      className="mx-4 mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-destructive text-sm"
                    >
                      {chatError}
                    </div>
                  ) : null}
                  <div className="flex-1 overflow-hidden">
                    <Thread />
                  </div>
                </SidebarInset>
              </div>
            </SidebarProvider>
          )}
        </AssistantRuntimeProvider>
        </ChatSessionProvider>
      </ChatModelProvider>
    </ChatModeProvider>
  );
};

const ChatShell: FC<{
  userId: string;
  threadListAdapter: RemoteThreadListAdapter;
  initialThreadId?: string;
  displayUsername: string;
}> = (props) => (
  <ChatUiThemeProvider>
    <ChatShellContent {...props} />
  </ChatUiThemeProvider>
);

export const Assistant: FC = () => {
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

  const threadListAdapter = useMemo(
    () => createSupabaseThreadListAdapter(supabase),
    [supabase],
  );

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
      threadListAdapter={threadListAdapter}
      initialThreadId={getLastActiveThreadId(user.id)}
      displayUsername={getDisplayUsername(user)}
    />
  );
};
