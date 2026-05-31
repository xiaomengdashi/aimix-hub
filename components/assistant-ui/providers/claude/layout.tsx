"use client";

import { PanelLeft } from "lucide-react";
import { ClaudeIcon } from "@/components/assistant-ui/providers/claude/icon";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { ProviderSwitch } from "@/components/assistant-ui/providers/shared/provider-switch";
import { ClaudeThreadList } from "@/components/assistant-ui/providers/claude/thread-list";
import { UserMenu } from "@/components/auth/user-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const ClaudeSidebarPanel: FC = () => (
  <div className="flex h-full min-h-0 flex-col">
    <div className="flex items-center gap-2 px-3 py-3">
      <ClaudeIcon className="size-5" />
      <span className="text-sm">Claude</span>
    </div>
    <div className="flex min-h-0 flex-1 flex-col px-2 pb-2">
      <ClaudeThreadList />
    </div>
    <div className="mt-auto shrink-0 border-[#E5E0D6] border-t px-2 py-3 dark:border-[#3d3a35]">
      <ProviderSwitch variant="claude" fullWidth />
    </div>
  </div>
);

export const ClaudeLayout: FC<{
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
}> = ({ displayUsername, chatError, children }) => {
  const isMobile = useIsMobile();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarOpen = isMobile ? mobileOpen : desktopOpen;

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((open) => !open);
    } else {
      setDesktopOpen((open) => !open);
    }
  };

  return (
    <div className="flex h-dvh w-full bg-[#F0ECE0] text-[#1a1a18] dark:bg-[#2b2a27] dark:text-[#eee]">
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col border-[#E5E0D6] border-r transition-[width] duration-200 md:flex dark:border-[#3d3a35]",
          desktopOpen ? "w-[260px]" : "w-0 overflow-hidden border-r-0",
        )}
      >
        <ClaudeSidebarPanel />
      </aside>

      <Sheet
        open={isMobile && mobileOpen}
        onOpenChange={(open) => {
          if (isMobile) setMobileOpen(open);
        }}
      >
          <SheetContent
            side="left"
            className="flex h-full w-[min(100vw,260px)] flex-col border-[#E5E0D6] bg-[#F0ECE0] p-0 text-[#1a1a18] dark:border-[#3d3a35] dark:bg-[#2b2a27] dark:text-[#eee] [&>button]:hidden"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>会话列表</SheetTitle>
              <SheetDescription>浏览与切换对话</SheetDescription>
            </SheetHeader>
            <ClaudeSidebarPanel />
          </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex size-9 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]"
            aria-label={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            <PanelLeft className="size-4" />
          </button>
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
