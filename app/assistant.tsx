"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useState, type FC } from "react";
import { ChatModelProvider } from "@/components/assistant-ui/chat-model-context";
import { ChatSessionProvider } from "@/components/assistant-ui/chat-session-context";
import { Thread } from "@/components/assistant-ui/thread";
import { ModelPicker } from "@/components/assistant-ui/model-picker";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useStableChatRuntime } from "@/hooks/use-stable-chat-runtime";
import { chatTransport } from "@/lib/chat-transport";

export const Assistant: FC = () => {
  const [chatError, setChatError] = useState<string | null>(null);

  const runtime = useStableChatRuntime({
    transport: chatTransport,
    onError: (error) => {
      setChatError(error.message || "发送失败，请稍后重试");
    },
    onFinish: () => {
      setChatError(null);
    },
  });

  return (
    <ChatModelProvider>
      <ChatSessionProvider onComposerSubmit={() => setChatError(null)}>
      <AssistantRuntimeProvider runtime={runtime}>
        <SidebarProvider>
          <div className="flex h-dvh w-full pr-0.5">
            <ThreadListSidebar />
            <SidebarInset>
              <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger />
                <ModelPicker />
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
      </AssistantRuntimeProvider>
      </ChatSessionProvider>
    </ChatModelProvider>
  );
};
