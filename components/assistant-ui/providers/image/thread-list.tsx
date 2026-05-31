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

export const ImageThreadList: FC = () => {
  const onNewClick = useThreadListNewClickHandler();

  return (
  <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col gap-1">
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        onClick={onNewClick}
        className="aui-thread-list-new h-9 justify-start gap-2 rounded-lg border-[#d4e4ff] bg-transparent px-3 text-[#0d3b8c] text-sm hover:bg-[#e6efff] dark:border-[#3d4f6f] dark:text-[#b8d4ff] dark:hover:bg-[#243044]"
      >
        <PlusIcon className="size-4" />
        新建绘图
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
        {() => <ImageThreadListItem />}
      </ThreadListPrimitive.Items>
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
        aria-label="加载会话"
        className="flex h-9 items-center px-3"
      >
        <Skeleton className="h-4 w-full" />
      </div>
    ))}
  </div>
);

const ImageThreadListItem: FC = () => (
  <ThreadListItemLastActivityTooltip>
    <ThreadListItemPrimitive.Root className="group flex h-9 items-center gap-2 rounded-lg transition-colors hover:bg-[#e6efff] data-active:bg-[#d4e4ff] dark:hover:bg-[#243044] dark:data-active:bg-[#2a3a52]">
      <ThreadListItemNavTrigger className="flex h-full min-w-0 flex-1 items-center px-3 text-start text-[#0d3b8c] text-sm dark:text-[#b8d4ff]">
        <ThreadListItemTitle fallback="新绘图" />
      </ThreadListItemNavTrigger>
      <ThreadListItemMoreMenu
        triggerClassName="me-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100 group-data-active:opacity-100"
        contentClassName="z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        itemClassName="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
        deleteItemClassName="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-destructive text-sm outline-none hover:bg-destructive/10"
        archiveLabel="归档"
        deleteLabel="删除"
        srOnlyLabel="更多操作"
      />
    </ThreadListItemPrimitive.Root>
  </ThreadListItemLastActivityTooltip>
);

