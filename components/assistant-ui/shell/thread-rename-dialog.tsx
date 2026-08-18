"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAui, useAuiState } from "@assistant-ui/store";
import { useEffect, useRef, useState, type FC } from "react";
import { MAX_THREAD_TITLE_LENGTH } from "@/lib/supabase/thread-title";

type ThreadRenameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ThreadRenameDialog: FC<ThreadRenameDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const aui = useAui();
  const title = useAuiState((s) => s.threadListItem.title);
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValue(title ?? "");
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, title]);

  const trimmed = value.trim();
  const canSave = trimmed.length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await aui
        .threadListItem
        .rename(trimmed.slice(0, MAX_THREAD_TITLE_LENGTH));
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>重命名会话</DialogTitle>
        </DialogHeader>
        <Input
          ref={inputRef}
          value={value}
          maxLength={MAX_THREAD_TITLE_LENGTH}
          placeholder="输入会话名称"
          disabled={isSaving}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSave();
            }
          }}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button type="button" disabled={!canSave} onClick={() => void handleSave()}>
            {isSaving ? "保存中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
