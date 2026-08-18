"use client";

import { Plus, Trash2 } from "lucide-react";
import type { FC } from "react";
import { ProviderSwitch } from "@/components/assistant-ui/providers/shared/provider-switch";
import { ImagePreviewDialog } from "@/components/assistant-ui/message/image-preview-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ImageSessionSummary } from "@/lib/image-generation/session";
import { formatRelativeConversationTime } from "@/lib/utils/format-relative-conversation-time";
import { cn } from "@/lib/utils";

type ImageStudioSidebarProps = {
  sessions: ImageSessionSummary[];
  activeId: string | null;
  composeMode: boolean;
  loading: boolean;
  onSelect: (id: string) => void;
  onCompose: () => void;
  onDelete: (id: string) => void;
  className?: string;
  onNavigate?: () => void;
};

export const ImageStudioSidebar: FC<ImageStudioSidebarProps> = ({
  sessions,
  activeId,
  composeMode,
  loading,
  onSelect,
  onCompose,
  onDelete,
  className,
  onNavigate,
}) => {
  const handleCompose = () => {
    onCompose();
    onNavigate?.();
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    onNavigate?.();
  };

  return (
  <div className={cn("flex h-full min-h-0 w-full flex-col bg-[#f0f6ff]/80 dark:bg-[#0c1018]/90", className)}>
    <section className="p-3">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start gap-2 border-[#d4e4ff] bg-white dark:border-[#3d4f6f] dark:bg-[#1a2332]"
        onClick={handleCompose}
      >
        <Plus className="size-4" />
        新建创作
      </Button>
    </section>

    <section className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
      {loading ? (
        <p className="px-2 py-4 text-center text-[#6b8fc7] text-xs">加载中…</p>
      ) : sessions.length === 0 ? (
        <p className="px-2 py-4 text-center text-[#6b8fc7] text-xs">暂无历史作品</p>
      ) : (
        <ul className="space-y-1">
          {sessions.map((s) => {
            const lastActivityLabel = formatRelativeConversationTime(s.updatedAt);

            return (
            <li key={s.id}>
              <section className="group flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleSelect(s.id)}
                      className={cn(
                        "flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        !composeMode && activeId === s.id
                          ? "bg-[#d4e4ff] text-[#0d3b8c] dark:bg-[#2a3a52] dark:text-[#b8d4ff]"
                          : "text-[#3d5a8c] hover:bg-[#e6efff] dark:text-[#8ab4f8] dark:hover:bg-[#1a2332]",
                      )}
                    >
                      <span className="line-clamp-2 font-medium">
                        {s.title ?? s.prompt}
                      </span>
                      <span className="text-[#6b8fc7] text-xs">
                        {s.status === "completed"
                          ? (s.modelName ?? s.model)
                          : s.status === "failed"
                            ? "失败"
                            : "生成中"}
                      </span>
                    </button>
                  </TooltipTrigger>
                  {lastActivityLabel ? (
                    <TooltipContent side="right" sideOffset={8}>
                      最近对话：{lastActivityLabel}
                    </TooltipContent>
                  ) : null}
                </Tooltip>
                {s.imageUrl && s.status === "completed" ? (
                  <ImagePreviewDialog
                    src={s.imageUrl}
                    alt={s.title ?? s.prompt}
                    title={s.title ?? s.prompt}
                    triggerClassName="size-11 shrink-0 overflow-hidden rounded-md"
                    imageClassName="size-11 object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  aria-label="删除"
                  onClick={() => onDelete(s.id)}
                  className="rounded p-1 text-[#6b8fc7] opacity-0 hover:bg-white/80 group-hover:opacity-100 dark:hover:bg-[#243044]"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </section>
            </li>
            );
          })}
        </ul>
      )}
    </section>

    <footer className="border-t border-[#d4e4ff]/60 p-3 dark:border-[#2a3a52]">
      <ProviderSwitch variant="image" fullWidth />
    </footer>
  </div>
  );
};
