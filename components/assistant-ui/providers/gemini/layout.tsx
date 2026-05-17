"use client";

import type { FC, ReactNode } from "react";
import { CollapsibleSidebarLayout } from "@/components/assistant-ui/providers/shared/collapsible-sidebar-layout";
import { GeminiThreadList } from "@/components/assistant-ui/providers/gemini/thread-list";
import { GeminiIcon } from "@/components/assistant-ui/providers/gemini/icon";

export const GeminiLayout: FC<{
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
}> = (props) => (
  <CollapsibleSidebarLayout
    {...props}
    switchVariant="gemini"
    threadList={<GeminiThreadList />}
    brand={
      <>
        <GeminiIcon className="size-5" />
        <span className="font-medium text-[#1f1f1f] text-sm dark:text-[#e3e3e3]">
          Gemini
        </span>
      </>
    }
    shellClassName="bg-[#f8f9fa] text-[#1f1f1f] dark:bg-[#131314] dark:text-[#e3e3e3]"
    sidebarBorderClassName="border-[#dadce0] dark:border-[#3c4043]"
    sheetClassName="border-[#dadce0] bg-[#f8f9fa] text-[#1f1f1f] dark:border-[#3c4043] dark:bg-[#131314] dark:text-[#e3e3e3]"
    headerButtonClassName="text-[#444746] hover:bg-[#444746]/8 dark:text-[#c4c7c5] dark:hover:bg-[#c4c7c5]/8"
    alertClassName="border border-[#dadce0] bg-[#fce8e6] text-[#c5221f] dark:border-[#3c4043] dark:bg-[#3c2020] dark:text-[#f28b82]"
    footerBorderClassName="border-[#dadce0] dark:border-[#3c4043]"
    contextUsageClassName="text-[#70757a] dark:text-[#9aa0a6]"
  />
);
