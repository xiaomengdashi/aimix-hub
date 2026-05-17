"use client";

import { useAuiState } from "@assistant-ui/store";
import type { FC } from "react";
import { useChatModel } from "@/components/assistant-ui/chat-model-context";
import {
  formatTokenCount,
  resolveThreadContextTokens,
} from "@/lib/chat-context-usage";
import { getChatModelContextWindow } from "@/lib/chat-models";
import { cn } from "@/lib/utils";

export const ContextUsageIndicator: FC<{
  variant?: "claude" | "shadcn";
  className?: string;
}> = ({ variant = "shadcn", className }) => {
  const { model } = useChatModel();
  const messages = useAuiState((s) => s.thread.messages);
  const isRunning = useAuiState((s) => s.thread.isRunning);

  const { tokens, source } = resolveThreadContextTokens(messages);
  const limit = getChatModelContextWindow(model);
  const ratio = limit > 0 ? Math.min(tokens / limit, 1) : 0;
  const isEstimate = source === "estimate" || isRunning;
  const isClaude = variant === "claude";

  const label = isEstimate ? "约" : "";
  const title = isEstimate
    ? "根据当前消息估算的上下文长度；生成完成后将显示 API 统计"
    : "当前会话上下文长度（最近一次请求的 input + output tokens）";

  return (
    <div
      role="status"
      aria-label={`上下文 ${formatTokenCount(tokens)}，上限 ${formatTokenCount(limit)}`}
      className={cn(
        "flex min-w-0 items-center gap-2",
        isClaude
          ? "text-[#8a8780] text-xs dark:text-[#a3a098]"
          : "text-muted-foreground text-xs",
        className,
      )}
      title={title}
    >
      <span className="shrink-0 whitespace-nowrap">
        上下文 {label}
        {formatTokenCount(tokens)} / {formatTokenCount(limit)}
      </span>
      <div
        className={cn(
          "h-1 min-w-12 flex-1 overflow-hidden rounded-full",
          isClaude ? "bg-[#E5E0D6] dark:bg-[#3d3a35]" : "bg-muted",
        )}
        aria-hidden
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            ratio >= 0.9
              ? "bg-destructive"
              : isClaude
                ? "bg-[#c96442]"
                : "bg-primary",
          )}
          style={{ width: `${Math.max(ratio * 100, tokens > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
};
