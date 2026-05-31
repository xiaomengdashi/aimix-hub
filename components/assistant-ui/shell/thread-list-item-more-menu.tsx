"use client";

import { Button } from "@/components/ui/button";
import {
  ThreadListItemMorePrimitive,
  ThreadListItemPrimitive,
} from "@assistant-ui/react";
import { useAui, useAuiState } from "@assistant-ui/store";
import {
  ArchiveIcon,
  MoreHorizontalIcon,
  PenLineIcon,
  PinIcon,
  PinOffIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo, useState, type FC } from "react";
import { isThreadPinned } from "@/lib/chat/thread-list-custom";
import { createClient } from "@/lib/supabase/client";
import { setThreadPinned } from "@/lib/supabase/thread-pin";
import { cn } from "@/lib/utils";
import { ThreadRenameDialog } from "@/components/assistant-ui/shell/thread-rename-dialog";

type ThreadListItemMoreMenuProps = {
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  deleteItemClassName?: string;
  archiveLabel?: string;
  deleteLabel?: string;
  renameLabel?: string;
  srOnlyLabel?: string;
};

const defaultTriggerClassName =
  "aui-thread-list-item-more me-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:bg-accent data-[state=open]:opacity-100 group-data-active:opacity-100";

const defaultContentClassName =
  "aui-thread-list-item-more-content z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md";

const defaultItemClassName =
  "aui-thread-list-item-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground";

const defaultDeleteItemClassName =
  "aui-thread-list-item-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-destructive text-sm outline-none hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive";

const ThreadListPinMenuItem: FC<{ className?: string }> = ({ className }) => {
  const aui = useAui();
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const isPinned = useAuiState((s) => isThreadPinned(s.threadListItem.custom));
  const supabase = useMemo(() => createClient(), []);

  return (
    <ThreadListItemMorePrimitive.Item
      className={className}
      onSelect={() => {
        if (!remoteId) return;
        void setThreadPinned(supabase, remoteId, !isPinned).then(() =>
          aui.threads().reload(),
        );
      }}
    >
      {isPinned ? (
        <>
          <PinOffIcon className="size-4" />
          取消置顶
        </>
      ) : (
        <>
          <PinIcon className="size-4" />
          置顶
        </>
      )}
    </ThreadListItemMorePrimitive.Item>
  );
};

const ThreadListRenameMenuItem: FC<{
  className?: string;
  label: string;
  onOpenRename: () => void;
}> = ({ className, label, onOpenRename }) => (
  <ThreadListItemMorePrimitive.Item
    className={className}
    onSelect={() => onOpenRename()}
  >
    <PenLineIcon className="size-4" />
    {label}
  </ThreadListItemMorePrimitive.Item>
);

export const ThreadListItemMoreMenu: FC<ThreadListItemMoreMenuProps> = ({
  triggerClassName,
  contentClassName,
  itemClassName,
  deleteItemClassName,
  archiveLabel = "Archive",
  deleteLabel = "Delete",
  renameLabel = "重命名",
  srOnlyLabel = "More options",
}) => {
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <>
      <ThreadListItemMorePrimitive.Root>
        <ThreadListItemMorePrimitive.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(defaultTriggerClassName, triggerClassName)}
          >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">{srOnlyLabel}</span>
          </Button>
        </ThreadListItemMorePrimitive.Trigger>
        <ThreadListItemMorePrimitive.Content
          side="bottom"
          align="start"
          className={cn(defaultContentClassName, contentClassName)}
        >
          <ThreadListPinMenuItem
            className={cn(defaultItemClassName, itemClassName)}
          />
          <ThreadListRenameMenuItem
            className={cn(defaultItemClassName, itemClassName)}
            label={renameLabel}
            onOpenRename={() => setRenameOpen(true)}
          />
          <ThreadListItemPrimitive.Archive asChild>
            <ThreadListItemMorePrimitive.Item
              className={cn(defaultItemClassName, itemClassName)}
            >
              <ArchiveIcon className="size-4" />
              {archiveLabel}
            </ThreadListItemMorePrimitive.Item>
          </ThreadListItemPrimitive.Archive>
          <ThreadListItemPrimitive.Delete asChild>
            <ThreadListItemMorePrimitive.Item
              className={cn(defaultDeleteItemClassName, deleteItemClassName)}
            >
              <TrashIcon className="size-4" />
              {deleteLabel}
            </ThreadListItemMorePrimitive.Item>
          </ThreadListItemPrimitive.Delete>
        </ThreadListItemMorePrimitive.Content>
      </ThreadListItemMorePrimitive.Root>
      <ThreadRenameDialog open={renameOpen} onOpenChange={setRenameOpen} />
    </>
  );
};
