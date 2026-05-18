"use client";

import type { FC, ReactNode } from "react";
import { ImageAppLogo } from "@/components/assistant-ui/providers/image/icon";
import { ImageThreadList } from "@/components/assistant-ui/providers/image/thread-list";
import { CollapsibleSidebarLayout } from "@/components/assistant-ui/providers/shared/collapsible-sidebar-layout";

export const ImageLayout: FC<{
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
}> = (props) => (
  <CollapsibleSidebarLayout
    {...props}
    switchVariant="image"
    threadList={<ImageThreadList />}
    brand={
      <>
        <ImageAppLogo variant="icon" />
        <span className="bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#0891b2] bg-clip-text font-semibold text-sm text-transparent dark:from-[#c4b5fd] dark:via-[#f9a8d4] dark:to-[#67e8f9]">
          GPT Image 2
        </span>
      </>
    }
    shellClassName="bg-[#f7faff] text-[#0d3b8c] dark:bg-[#0f1419] dark:text-[#b8d4ff]"
    sidebarBorderClassName="border-[#d4e4ff] dark:border-[#2a3a52]"
    sheetClassName="border-[#d4e4ff] bg-[#f7faff] text-[#0d3b8c] dark:border-[#2a3a52] dark:bg-[#0f1419] dark:text-[#b8d4ff]"
    headerButtonClassName="text-[#3d5a8c] hover:bg-[#e6efff] hover:text-[#0d3b8c] dark:text-[#8ab4f8] dark:hover:bg-[#243044] dark:hover:text-[#b8d4ff]"
    alertClassName="border border-destructive/30 bg-destructive/10 text-destructive"
    footerBorderClassName="border-[#d4e4ff] dark:border-[#2a3a52]"
    contextUsageClassName="text-[#3d5a8c] dark:text-[#8ab4f8]"
  />
);
