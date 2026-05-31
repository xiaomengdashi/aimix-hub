import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AuiIf,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { PlusIcon } from "lucide-react";
import { ThreadListItemMoreMenu } from "@/components/assistant-ui/shell/thread-list-item-more-menu";
import { ThreadListItemLastActivityTooltip } from "@/components/assistant-ui/shell/thread-list-item-last-activity-tooltip";
import { ThreadListItemTitle } from "@/components/assistant-ui/shell/thread-list-item-title";
import {
  ThreadListItemNavTrigger,
  useThreadListNewClickHandler,
} from "@/components/assistant-ui/shell/thread-list-navigation";
import type { FC } from "react";
import { cn } from "@/lib/utils";

type ThreadListVariant = "default" | "claude";

export const ThreadList: FC<{ variant?: ThreadListVariant }> = ({
  variant = "default",
}) => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col gap-1">
      <ThreadListNew variant={variant} />
      <AuiIf
        condition={(s) => s.threads.isLoading && s.threads.threadIds.length === 0}
      >
        <ThreadListSkeleton variant={variant} />
      </AuiIf>
      <AuiIf
        condition={(s) => !s.threads.isLoading || s.threads.threadIds.length > 0}
      >
        <ThreadListPrimitive.Items>
          {() => <ThreadListItem variant={variant} />}
        </ThreadListPrimitive.Items>
      </AuiIf>
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC<{ variant: ThreadListVariant }> = ({ variant }) => {
  const isClaude = variant === "claude";
  const onNewClick = useThreadListNewClickHandler();

  return (
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        onClick={onNewClick}
        className={cn(
          "aui-thread-list-new h-9 justify-start gap-2 rounded-lg px-3 text-sm",
          isClaude
            ? "border-[#E5E0D6] bg-transparent text-[#3d3a35] hover:bg-white/60 dark:border-[#3d3a35] dark:text-[#cdc9be] dark:hover:bg-[#1f1e1b]/60"
            : "hover:bg-muted data-active:bg-muted",
        )}
      >
        <PlusIcon className="size-4" />
        {isClaude ? "New chat" : "New Thread"}
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListSkeleton: FC<{ variant: ThreadListVariant }> = () => {
  return (
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
};

const ThreadListItem: FC<{ variant: ThreadListVariant }> = ({ variant }) => {
  const isClaude = variant === "claude";

  return (
    <ThreadListItemLastActivityTooltip>
      <ThreadListItemPrimitive.Root
        className={cn(
          "aui-thread-list-item group flex h-9 items-center gap-2 rounded-lg transition-colors focus-visible:outline-none",
          isClaude
            ? "hover:bg-[#E5E0D6]/70 focus-visible:bg-[#E5E0D6]/70 data-active:bg-[#E5E0D6] dark:hover:bg-[#393937]/70 dark:focus-visible:bg-[#393937]/70 dark:data-active:bg-[#393937]"
            : "hover:bg-muted focus-visible:bg-muted data-active:bg-muted",
        )}
      >
        <ThreadListItemNavTrigger
          className={cn(
            "aui-thread-list-item-trigger flex h-full min-w-0 flex-1 items-center px-3 text-start text-sm",
            isClaude && "text-[#3d3a35] dark:text-[#cdc9be]",
          )}
        >
          <ThreadListItemTitle />
        </ThreadListItemNavTrigger>
        <ThreadListItemMoreMenu />
      </ThreadListItemPrimitive.Root>
    </ThreadListItemLastActivityTooltip>
  );
};

