"use client";

import { useAuiState } from "@assistant-ui/store";
import type { FC, ReactNode } from "react";
import { buildThreadQuestionAnchorId } from "@/lib/chat/thread-question-outline";
import { cn } from "@/lib/utils";

/** 包裹用户消息区域，提供目录滚动锚点（scroll-mt 适配顶栏） */
export const ThreadQuestionAnchor: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const messageId = useAuiState((s) => s.message.id);
  const role = useAuiState((s) => s.message.role);

  if (role !== "user") {
    return <>{children}</>;
  }

  return (
    <div
      id={buildThreadQuestionAnchorId(messageId)}
      className={cn("scroll-mt-20", className)}
    >
      {children}
    </div>
  );
};
