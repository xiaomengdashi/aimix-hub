"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AuiIf,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { useAuiState } from "@assistant-ui/store";
import { ArchiveRestoreIcon } from "lucide-react";
import type { FC } from "react";
import { cn } from "@/lib/utils";

type ArchivedThreadsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ArchivedThreadsDialog: FC<ArchivedThreadsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const archivedCount = useAuiState((s) => s.threads.archivedThreadIds.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(32rem,85vh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-4 text-left">
          <DialogTitle>已归档会话</DialogTitle>
          <DialogDescription>
            {archivedCount > 0
              ? `共 ${archivedCount} 个会话。点击可打开，恢复后将回到侧边栏列表。`
              : "归档的会话会保存在云端，可随时在此恢复。"}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <AuiIf condition={(s) => s.threads.isLoading}>
            <p className="px-3 py-8 text-center text-muted-foreground text-sm">
              加载中…
            </p>
          </AuiIf>
          <AuiIf condition={(s) => !s.threads.isLoading}>
            <AuiIf condition={(s) => s.threads.archivedThreadIds.length === 0}>
              <p className="px-3 py-8 text-center text-muted-foreground text-sm">
                暂无已归档会话
              </p>
            </AuiIf>
            <AuiIf condition={(s) => s.threads.archivedThreadIds.length > 0}>
              <ThreadListPrimitive.Root className="flex flex-col gap-1">
                <ThreadListPrimitive.Items archived>
                  {() => (
                    <ArchivedThreadListItem
                      onSelect={() => onOpenChange(false)}
                    />
                  )}
                </ThreadListPrimitive.Items>
              </ThreadListPrimitive.Root>
            </AuiIf>
          </AuiIf>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ArchivedThreadListItem: FC<{ onSelect: () => void }> = ({
  onSelect,
}) => {
  return (
    <ThreadListItemPrimitive.Root className="group flex items-center gap-1 rounded-lg hover:bg-muted focus-visible:bg-muted">
      <ThreadListItemPrimitive.Trigger
        className="flex min-w-0 flex-1 items-center rounded-lg px-3 py-2 text-start text-sm outline-none"
        onClick={onSelect}
      >
        <span className="min-w-0 flex-1 truncate">
          <ThreadListItemPrimitive.Title fallback="未命名会话" />
        </span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Unarchive asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "me-1 h-8 shrink-0 gap-1.5 px-2 text-xs",
            "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <ArchiveRestoreIcon className="size-3.5" />
          恢复
        </Button>
      </ThreadListItemPrimitive.Unarchive>
    </ThreadListItemPrimitive.Root>
  );
};
