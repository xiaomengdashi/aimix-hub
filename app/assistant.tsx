"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { PanelLeft, Sparkle } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { Claude } from "@/components/assistant-ui/claude";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { useStableChatRuntime } from "@/hooks/use-stable-chat-runtime";
import { chatTransport, selectedChatModel } from "@/lib/chat-transport";
import { cn } from "@/lib/utils";

export const Assistant: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [model, setModel] = useState(selectedChatModel.value);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    selectedChatModel.value = model;
  }, [model]);

  const runtime = useStableChatRuntime({
    transport: chatTransport,
    onError: (error) => {
      setChatError(error.message || "发送失败，请稍后重试");
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full overflow-hidden bg-[#F0ECE0] font-serif text-[#1a1a18] dark:bg-[#2b2a27] dark:text-[#eee]">
        <aside
          className={cn(
            "w-[260px] shrink-0 flex-col border-[#E5E0D6] border-r bg-[#E8E4D9] dark:border-[#3d3a35] dark:bg-[#242320]",
            sidebarOpen ? "flex" : "hidden",
          )}
        >
          <div className="flex items-center gap-2 px-3 py-3">
            <Sparkle className="size-5 fill-[#c96442] text-[#c96442]" />
            <span className="font-serif text-[#1a1a18] text-sm dark:text-[#eee]">
              Claude
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-2 pb-3">
            <ThreadList />
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="absolute top-3 left-3 z-10 flex size-9 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]"
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <PanelLeft className="size-5" />
          </button>
          {chatError ? (
            <div
              role="alert"
              className="absolute top-12 right-4 left-4 z-20 rounded-lg border border-[#c96442]/30 bg-white px-4 py-2 font-serif text-[#c96442] text-sm shadow-sm dark:bg-[#1f1e1b]"
            >
              {chatError}
            </div>
          ) : null}
          <Claude
            model={model}
            onModelChange={setModel}
            onSend={() => setChatError(null)}
          />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
};
