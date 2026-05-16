"use client";

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

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="flex min-h-0 flex-1 flex-col gap-1">
      <ThreadListNew />
      <AuiIf condition={(s) => s.threads.isLoading}>
        <ThreadListSkeleton />
      </AuiIf>
      <AuiIf condition={(s) => !s.threads.isLoading}>
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
          <ThreadListPrimitive.Items>
            {() => <ThreadListItem />}
          </ThreadListPrimitive.Items>
        </div>
      </AuiIf>
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left font-serif text-[#1a1a18] text-sm transition-colors hover:bg-[#1a1a18]/5 data-active:bg-white/70 dark:text-[#eee] dark:hover:bg-white/5 dark:data-active:bg-[#1f1e1b]/80">
      <PlusIcon className="size-4 shrink-0 opacity-70" />
      <span>New chat</span>
    </ThreadListPrimitive.New>
  );
};

const ThreadListSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-1 px-1 pt-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="h-9 animate-pulse rounded-lg bg-[#1a1a18]/5 dark:bg-white/5"
        />
      ))}
    </div>
  );
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="group/item relative flex items-center rounded-lg data-active:bg-white/70 dark:data-active:bg-[#1f1e1b]/80">
      <ThreadListItemPrimitive.Trigger className="flex min-w-0 flex-1 items-center rounded-lg px-2.5 py-2 text-left font-serif text-[#1a1a18] text-sm transition-colors hover:bg-[#1a1a18]/5 dark:text-[#eee] dark:hover:bg-white/5">
        <span className="truncate">
          <ThreadListItemPrimitive.Title fallback="New chat" />
        </span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemMore />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemMore: FC = () => {
  return (
    <ThreadListItemMorePrimitive.Root>
      <ThreadListItemMorePrimitive.Trigger
        className={cn(
          "mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-[#5b5950] opacity-0 transition-opacity",
          "hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] group-hover/item:opacity-100 group-focus-within/item:opacity-100",
          "data-[state=open]:opacity-100 dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]",
        )}
      >
        <MoreHorizontalIcon className="size-4" />
        <span className="sr-only">More options</span>
      </ThreadListItemMorePrimitive.Trigger>
      <ThreadListItemMorePrimitive.Content
        className="min-w-40 rounded-xl border border-[#E5E0D6] bg-white p-1.5 font-serif text-sm shadow-lg dark:border-[#3d3a35] dark:bg-[#1f1e1b]"
        sideOffset={4}
      >
        <ThreadListItemMorePrimitive.Item className="flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-[#1a1a18] outline-none transition-colors hover:bg-[#F0ECE0] focus:bg-[#F0ECE0] dark:text-[#eee] dark:hover:bg-[#2b2a27] dark:focus:bg-[#2b2a27]">
          <ThreadListItemPrimitive.Archive className="flex w-full items-center gap-2">
            <ArchiveIcon className="size-4 opacity-70" />
            Archive
          </ThreadListItemPrimitive.Archive>
        </ThreadListItemMorePrimitive.Item>
        <ThreadListItemMorePrimitive.Separator className="my-1 h-px bg-[#E5E0D6] dark:bg-[#3d3a35]" />
        <ThreadListItemMorePrimitive.Item className="flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-[#c96442] outline-none transition-colors hover:bg-[#F0ECE0] focus:bg-[#F0ECE0] dark:hover:bg-[#2b2a27] dark:focus:bg-[#2b2a27]">
          <ThreadListItemPrimitive.Delete className="flex w-full items-center gap-2">
            <TrashIcon className="size-4 opacity-70" />
            Delete
          </ThreadListItemPrimitive.Delete>
        </ThreadListItemMorePrimitive.Item>
      </ThreadListItemMorePrimitive.Content>
    </ThreadListItemMorePrimitive.Root>
  );
};
