"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AuiIf,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { PlusIcon } from "lucide-react";
import type { FC } from "react";
import { ThreadListItemMoreMenu } from "@/components/assistant-ui/shell/thread-list-item-more-menu";
import { ThreadListItemLastActivityTooltip } from "@/components/assistant-ui/shell/thread-list-item-last-activity-tooltip";
import { ThreadListItemTitle } from "@/components/assistant-ui/shell/thread-list-item-title";
import { GroupedThreadListItems } from "@/components/assistant-ui/shell/grouped-thread-list-items";
import {
  ThreadListItemNavTrigger,
  useThreadListNewClickHandler,
} from "@/components/assistant-ui/shell/thread-list-navigation";

export const ChatGPTThreadList: FC = () => {
  const onNewClick = useThreadListNewClickHandler();

  return (
  <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col gap-1">
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        onClick={onNewClick}
        className="aui-thread-list-new h-9 justify-start gap-2 rounded-lg border-[#e5e5e5] bg-transparent px-3 text-[#0d0d0d] text-sm hover:bg-[#f0f0f0] dark:border-transparent dark:text-[#ececec] dark:hover:bg-[#424242]"
      >
        <PlusIcon className="size-4" />
        New chat
      </Button>
    </ThreadListPrimitive.New>
    <AuiIf
      condition={(s) => s.threads.isLoading && s.threads.threadIds.length === 0}
    >
      <ThreadListSkeleton />
    </AuiIf>
    <AuiIf
      condition={(s) => !s.threads.isLoading || s.threads.threadIds.length > 0}
    >
        <GroupedThreadListItems
          ThreadListItem={ChatGPTThreadListItem}
          labelClassName="text-[#8e8e8e] dark:text-[#8e8e8e]"
        />
    </AuiIf>
  </ThreadListPrimitive.Root>
  );
};

const ThreadListSkeleton: FC = () => (
  <div className="flex flex-col gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        role="status"
        aria-label="Loading threads"
        className="flex h-9 items-center px-3"
      >
        <Skeleton className="h-4 w-full" />
      </div>
    ))}
  </div>
);

const ChatGPTThreadListItem: FC = () => (
  <ThreadListItemLastActivityTooltip>
    <ThreadListItemPrimitive.Root className="group flex h-9 items-center gap-2 rounded-lg transition-colors hover:bg-[#0d0d0d]/5 data-active:bg-[#0d0d0d]/8 dark:hover:bg-white/10 dark:data-active:bg-white/15">
      <ThreadListItemNavTrigger className="flex h-full min-w-0 flex-1 items-center px-3 text-start text-[#0d0d0d] text-sm dark:text-[#ececec]">
        <ThreadListItemTitle />
      </ThreadListItemNavTrigger>
      <ThreadListItemMoreMenu
        triggerClassName="me-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100 group-data-active:opacity-100"
        contentClassName="z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        itemClassName="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
        deleteItemClassName="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-destructive text-sm outline-none hover:bg-destructive/10"
      />
    </ThreadListItemPrimitive.Root>
  </ThreadListItemLastActivityTooltip>
);

