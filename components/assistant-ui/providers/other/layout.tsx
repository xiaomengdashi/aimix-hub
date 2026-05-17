"use client";

import type { FC, ReactNode } from "react";
import { OtherThreadListSidebar } from "@/components/assistant-ui/providers/other/thread-list-sidebar";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import { ModelPicker } from "@/components/assistant-ui/model-picker";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/auth/user-menu";

export const OtherLayout: FC<{
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
}> = ({ displayUsername, chatError, children }) => (
  <SidebarProvider>
    <div className="flex h-dvh w-full pr-0.5">
      <OtherThreadListSidebar />
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
        <div className="flex-1 overflow-hidden">{children}</div>
      </SidebarInset>
    </div>
  </SidebarProvider>
);
