"use client";

import { PanelLeft, Sparkle } from "lucide-react";
import { useState, type FC, type ReactNode } from "react";
import { ChatUiThemeSwitch } from "@/components/assistant-ui/chat-ui-theme-switch";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";

export const ClaudeChatLayout: FC<{
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
}> = ({ displayUsername, chatError, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-dvh w-full bg-[#F0ECE0] font-serif text-[#1a1a18] dark:bg-[#2b2a27] dark:text-[#eee]">
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-[#E5E0D6] border-r transition-[width] duration-200 dark:border-[#3d3a35]",
          sidebarOpen ? "w-[260px]" : "w-0 overflow-hidden border-r-0",
        )}
      >
        <div className="flex items-center gap-2 px-3 py-3">
          <Sparkle className="size-5 fill-[#c96442] text-[#c96442]" />
          <span className="font-serif text-sm">Claude</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-2 pb-2">
          <ThreadList variant="claude" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]"
            aria-label={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            <PanelLeft className="size-4" />
          </button>
          <ChatUiThemeSwitch variant="claude" />
          <UserMenu displayName={displayUsername} />
        </header>
        {chatError ? (
          <div
            role="alert"
            className="mx-3 mb-2 rounded-lg border border-[#c96442]/40 bg-[#c96442]/10 px-4 py-2 text-[#8a3b28] text-sm dark:text-[#f0c4b5]"
          >
            {chatError}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
