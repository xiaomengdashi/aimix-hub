import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AuiIf,
  ThreadListItemMorePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import {
  ArchiveIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import type { FC } from "react";
import { cn } from "@/lib/utils";

type ThreadListVariant = "default" | "claude";

export const ThreadList: FC<{ variant?: ThreadListVariant }> = ({
  variant = "default",
}) => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col gap-1">
      <ThreadListNew variant={variant} />
      <AuiIf condition={(s) => s.threads.isLoading}>
        <ThreadListSkeleton variant={variant} />
      </AuiIf>
      <AuiIf condition={(s) => !s.threads.isLoading}>
        <ThreadListPrimitive.Items>
          {() => <ThreadListItem variant={variant} />}
        </ThreadListPrimitive.Items>
      </AuiIf>
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC<{ variant: ThreadListVariant }> = ({ variant }) => {
  const isClaude = variant === "claude";

  return (
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        className={cn(
          "aui-thread-list-new h-9 justify-start gap-2 rounded-lg px-3 text-sm",
          isClaude
            ? "border-[#E5E0D6] bg-transparent font-serif text-[#3d3a35] hover:bg-white/60 dark:border-[#3d3a35] dark:text-[#cdc9be] dark:hover:bg-[#1f1e1b]/60"
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
    <ThreadListItemPrimitive.Root
      className={cn(
        "aui-thread-list-item group flex h-9 items-center gap-2 rounded-lg transition-colors focus-visible:outline-none",
        isClaude
          ? "font-serif hover:bg-[#E5E0D6]/70 focus-visible:bg-[#E5E0D6]/70 data-active:bg-[#E5E0D6] dark:hover:bg-[#393937]/70 dark:focus-visible:bg-[#393937]/70 dark:data-active:bg-[#393937]"
          : "hover:bg-muted focus-visible:bg-muted data-active:bg-muted",
      )}
    >
      <ThreadListItemPrimitive.Trigger
        className={cn(
          "aui-thread-list-item-trigger flex h-full min-w-0 flex-1 items-center px-3 text-start text-sm",
          isClaude && "text-[#3d3a35] dark:text-[#cdc9be]",
        )}
      >
        <span className="aui-thread-list-item-title min-w-0 flex-1 truncate">
          <ThreadListItemPrimitive.Title fallback="New Chat" />
        </span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemMore />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemMore: FC = () => {
  return (
    <ThreadListItemMorePrimitive.Root>
      <ThreadListItemMorePrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="aui-thread-list-item-more me-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:bg-accent data-[state=open]:opacity-100 group-data-active:opacity-100"
        >
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">More options</span>
        </Button>
      </ThreadListItemMorePrimitive.Trigger>
      <ThreadListItemMorePrimitive.Content
        side="bottom"
        align="start"
        className="aui-thread-list-item-more-content z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      >
        <ThreadListItemPrimitive.Archive asChild>
          <ThreadListItemMorePrimitive.Item className="aui-thread-list-item-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            <ArchiveIcon className="size-4" />
            Archive
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemPrimitive.Archive>
        <ThreadListItemPrimitive.Delete asChild>
          <ThreadListItemMorePrimitive.Item className="aui-thread-list-item-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-destructive text-sm outline-none hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive">
            <TrashIcon className="size-4" />
            Delete
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemPrimitive.Delete>
      </ThreadListItemMorePrimitive.Content>
    </ThreadListItemMorePrimitive.Root>
  );
};
