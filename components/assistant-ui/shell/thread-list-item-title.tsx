"use client";

import { ThreadListItemPrimitive } from "@assistant-ui/react";
import { useAuiState } from "@assistant-ui/store";
import { PinIcon } from "lucide-react";
import type { FC } from "react";
import { isThreadPinned } from "@/lib/chat/thread-list-custom";
import { cn } from "@/lib/utils";

type ThreadListItemTitleProps = {
  fallback?: string;
  className?: string;
  pinIconClassName?: string;
};

export const ThreadListItemTitle: FC<ThreadListItemTitleProps> = ({
  fallback = "New Chat",
  className,
  pinIconClassName,
}) => {
  const isPinned = useAuiState((s) => isThreadPinned(s.threadListItem.custom));

  return (
    <span
      className={cn(
        "aui-thread-list-item-title flex min-w-0 flex-1 items-center gap-1.5",
        className,
      )}
    >
      {isPinned ? (
        <PinIcon
          className={cn("size-3 shrink-0 text-muted-foreground", pinIconClassName)}
          aria-hidden
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">
        <ThreadListItemPrimitive.Title fallback={fallback} />
      </span>
    </span>
  );
};
