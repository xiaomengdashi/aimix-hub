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
import {
  ThreadListItemNavTrigger,
  useThreadListNewClickHandler,
} from "@/components/assistant-ui/shell/thread-list-navigation";

export const GeminiThreadList: FC = () => {
  const onNewClick = useThreadListNewClickHandler();

  return (
  <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col gap-1">
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        onClick={onNewClick}
        className="aui-thread-list-new h-9 justify-start gap-2 rounded-lg border-[#dadce0] bg-white px-3 text-[#444746] text-sm shadow-sm hover:bg-[#f1f3f4] dark:border-[#3c4043] dark:bg-[#282a2c] dark:text-[#c4c7c5] dark:hover:bg-[#333537]"
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
      <ThreadListPrimitive.Items>
        {() => <GeminiThreadListItem />}
      </ThreadListPrimitive.Items>
    </AuiIf>
  </ThreadListPrimitive.Root>
  );
};

const ThreadListSkeleton: FC = () => (
  <div className="flex flex-col gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} role="status" aria-label="Loading threads" className="flex h-9 items-center px-3">
        <Skeleton className="h-4 w-full" />
      </div>
    ))}
  </div>
);

const GeminiThreadListItem: FC = () => (
  <ThreadListItemLastActivityTooltip>
    <ThreadListItemPrimitive.Root className="group flex h-9 items-center gap-2 rounded-lg transition-colors hover:bg-[#444746]/8 data-active:bg-[#444746]/12 dark:hover:bg-[#c4c7c5]/8 dark:data-active:bg-[#c4c7c5]/12">
      <ThreadListItemNavTrigger className="flex h-full min-w-0 flex-1 items-center px-3 text-start text-[#444746] text-sm dark:text-[#c4c7c5]">
        <ThreadListItemTitle />
      </ThreadListItemNavTrigger>
      <ThreadListItemMoreMenu
        triggerClassName="me-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100 group-data-active:opacity-100"
        contentClassName="z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        itemClassName="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
      />
    </ThreadListItemPrimitive.Root>
  </ThreadListItemLastActivityTooltip>
);

