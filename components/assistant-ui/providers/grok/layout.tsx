"use client";

import type { FC, ReactNode } from "react";
import { CollapsibleSidebarLayout } from "@/components/assistant-ui/providers/shared/collapsible-sidebar-layout";
import { GrokThreadList } from "@/components/assistant-ui/providers/grok/thread-list";
import { GrokIcon } from "@/components/assistant-ui/providers/grok/icon";

export const GrokLayout: FC<{
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
}> = (props) => (
  <CollapsibleSidebarLayout
    {...props}
    switchVariant="grok"
    threadList={<GrokThreadList />}
    brand={
      <>
        <GrokIcon className="size-5 text-[#0d0d0d] dark:text-white" />
        <span className="font-medium text-[#0d0d0d] text-sm dark:text-white">
          Grok
        </span>
      </>
    }
    shellClassName="bg-[#fdfdfd] text-[#0d0d0d] dark:bg-[#141414] dark:text-white"
    sidebarBorderClassName="border-[#e5e5e5] dark:border-[#2a2a2a]"
    sheetClassName="border-[#e5e5e5] bg-[#fdfdfd] text-[#0d0d0d] dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-white"
    headerButtonClassName="text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#0d0d0d] dark:text-[#9a9a9a] dark:hover:bg-[#2a2a2a] dark:hover:text-white"
    alertClassName="border border-[#e5e5e5] bg-[#fff4f4] text-[#c5221f] dark:border-[#2a2a2a] dark:bg-[#3c2020] dark:text-[#f28b82]"
    footerBorderClassName="border-[#e5e5e5] dark:border-[#2a2a2a]"
    contextUsageClassName="text-[#9a9a9a] dark:text-[#6b6b6b]"
  />
);
