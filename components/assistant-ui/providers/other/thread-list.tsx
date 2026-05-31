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

export const OtherThreadList: FC = () => {
  const onNewClick = useThreadListNewClickHandler();

  return (
  <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col gap-1">
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        onClick={onNewClick}
        className="aui-thread-list-new h-9 justify-start gap-2 rounded-lg px-3 text-sm hover:bg-muted data-active:bg-muted"
      >
        <PlusIcon className="size-4" />
        New Thread
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
        {() => <OtherThreadListItem />}
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
        aria-label="Loading threads"
        className="aui-thread-list-skeleton-wrapper flex h-9 items-center px-3"
      >
        <Skeleton className="aui-thread-list-skeleton h-4 w-full" />
      </div>
    ))}
  </div>
);

const OtherThreadListItem: FC = () => (
  <ThreadListItemLastActivityTooltip>
    <ThreadListItemPrimitive.Root className="aui-thread-list-item group flex h-9 items-center gap-2 rounded-lg transition-colors hover:bg-muted focus-visible:bg-muted data-active:bg-muted">
      <ThreadListItemNavTrigger className="aui-thread-list-item-trigger flex h-full min-w-0 flex-1 items-center px-3 text-start text-sm">
        <ThreadListItemTitle />
      </ThreadListItemNavTrigger>
      <ThreadListItemMoreMenu />
    </ThreadListItemPrimitive.Root>
  </ThreadListItemLastActivityTooltip>
);

