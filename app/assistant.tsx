"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import type { RemoteThreadListAdapter } from "@assistant-ui/core";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { ChatThreadUrlSync } from "@/components/assistant-ui/shell/chat-thread-url-sync";
import { ChatDeferredThreadSwitch } from "@/components/assistant-ui/shell/chat-deferred-thread-switch";
import { ChatThreadTitleOnFirstRun } from "@/components/assistant-ui/shell/chat-thread-title-on-first-run";
import { ChatThreadListOrderSync } from "@/components/assistant-ui/shell/chat-thread-list-order-sync";
import { ArtifactThreadSync } from "@/components/assistant-ui/artifacts/artifact-thread-sync";
import { ArtifactWorkspace } from "@/components/assistant-ui/artifacts/artifact-panel";
import { ChatModeProvider } from "@/components/assistant-ui/contexts/chat-mode-context";
import { ChatModelProvider } from "@/components/assistant-ui/contexts/chat-model-context";
import { ComposerToolProvider } from "@/components/assistant-ui/contexts/composer-tool-context";
import { ChatSessionProvider } from "@/components/assistant-ui/contexts/chat-session-context";
import {
  ChatAiProviderProvider,
  useAppNav,
} from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { getAppUI } from "@/components/assistant-ui/providers/registry";
import type { AppId } from "@/lib/chat/app-id";
import { isImageApp } from "@/lib/chat/app-id";
import { useStableChatRuntime } from "@/hooks/use-stable-chat-runtime";
import { threadIdFromPathname } from "@/lib/chat/routes";
import { useEffect, useMemo, useState, type FC } from "react";
import { chatTransport } from "@/lib/chat/transport";
import { createClient } from "@/lib/supabase/client";
import { getDisplayUsername } from "@/lib/auth/username";
import { createSupabaseThreadListAdapter } from "@/lib/supabase/thread-adapter";

const ChatShellContent: FC<{
  userId: string;
  threadListAdapter: RemoteThreadListAdapter;
  threadId?: string;
  displayUsername: string;
  appId: AppId;
}> = ({
  userId,
  threadListAdapter,
  threadId,
  displayUsername,
  appId,
}) => {
  const [chatError, setChatError] = useState<string | null>(null);
  const { Layout, Thread } = getAppUI(appId);

  const runtime = useStableChatRuntime({
    threadListAdapter,
    transport: chatTransport,
    onError: (error) => {
      setChatError(error.message || "发送失败，请稍后重试");
    },
    onFinish: () => {
      setChatError(null);
    },
  });

  const shell = (
    <ChatModelProvider uiScope={appId}>
      <AssistantRuntimeProvider runtime={runtime}>
        <ChatDeferredThreadSwitch threadId={threadId} />
        <ChatThreadTitleOnFirstRun />
        <ChatThreadUrlSync userId={userId} appId={appId} />
        <ChatThreadListOrderSync />
        <Layout displayUsername={displayUsername} chatError={chatError}>
          <ArtifactWorkspace>
            <ArtifactThreadSync />
            <Thread />
          </ArtifactWorkspace>
        </Layout>
      </AssistantRuntimeProvider>
    </ChatModelProvider>
  );

  if (isImageApp(appId)) {
    return (
      <ChatSessionProvider
        onComposerSubmit={() => setChatError(null)}
        onAttachmentError={(message) => setChatError(message)}
      >
        {shell}
      </ChatSessionProvider>
    );
  }

  return (
    <ChatModeProvider>
      <ComposerToolProvider uiProvider={appId}>
        <ChatSessionProvider
          onComposerSubmit={() => setChatError(null)}
          onAttachmentError={(message) => setChatError(message)}
        >
          {shell}
        </ChatSessionProvider>
      </ComposerToolProvider>
    </ChatModeProvider>
  );
};

const ChatShellInner: FC<{
  userId: string;
  displayUsername: string;
}> = ({ userId, displayUsername }) => {
  const { appId } = useAppNav();
  const pathname = usePathname();
  const threadId = threadIdFromPathname(pathname) ?? undefined;
  const supabase = useMemo(() => createClient(), []);

  const threadListAdapter = useMemo(
    () => createSupabaseThreadListAdapter(supabase, appId),
    [supabase, appId],
  );

  return (
    <ChatShellContent
      key={appId}
      userId={userId}
      threadListAdapter={threadListAdapter}
      threadId={threadId}
      displayUsername={displayUsername}
      appId={appId}
    />
  );
};

const ChatShell: FC<{
  userId: string;
  displayUsername: string;
  initialAppId: AppId;
}> = ({ initialAppId, ...props }) => (
  <ChatAiProviderProvider initialProvider={initialAppId}>
    <ChatShellInner {...props} />
  </ChatAiProviderProvider>
);

export const Assistant: FC<{ initialAppId: AppId }> = ({ initialAppId }) => {
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
      initialAppId={initialAppId}
    />
  );
};
