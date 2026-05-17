"use client";

import type { FC, ReactNode } from "react";
import { OpenAIIcon } from "@/components/assistant-ui/providers/chatgpt/icon";
import { CollapsibleSidebarLayout } from "@/components/assistant-ui/providers/shared/collapsible-sidebar-layout";
import { ChatGPTThreadList } from "@/components/assistant-ui/providers/chatgpt/thread-list";

export const ChatGPTLayout: FC<{
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
}> = (props) => (
  <CollapsibleSidebarLayout
    {...props}
    switchVariant="chatgpt"
    threadList={<ChatGPTThreadList />}
    brand={
      <>
        <OpenAIIcon className="size-5 text-[#0d0d0d] dark:text-[#ececec]" />
        <span className="font-medium text-[#0d0d0d] text-sm dark:text-[#ececec]">
          ChatGPT
        </span>
      </>
    }
    shellClassName="bg-white text-[#0d0d0d] dark:bg-[#212121] dark:text-[#ececec]"
    sidebarBorderClassName="border-[#e5e5e5] dark:border-[#303030]"
    sheetClassName="border-[#e5e5e5] bg-white text-[#0d0d0d] dark:border-[#303030] dark:bg-[#212121] dark:text-[#ececec]"
    headerButtonClassName="text-[#5d5d5d] hover:bg-[#0d0d0d]/5 hover:text-[#0d0d0d] dark:text-[#cdcdcd] dark:hover:bg-white/10 dark:hover:text-white"
    alertClassName="border border-destructive/30 bg-destructive/10 text-destructive"
    footerBorderClassName="border-[#e5e5e5] dark:border-[#303030]"
    contextUsageClassName="text-[#5d5d5d] dark:text-[#a8a8a8]"
  />
);
