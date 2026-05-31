"use client";

import { useAuiState } from "@assistant-ui/store";
import type { FC, PropsWithChildren } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getThreadLastMessageAt } from "@/lib/chat/thread-list-custom";
import { formatRelativeConversationTime } from "@/lib/utils/format-relative-conversation-time";

export const ThreadListItemLastActivityTooltip: FC<PropsWithChildren> = ({
  children,
}) => {
  const lastMessageAt = useAuiState((s) =>
    getThreadLastMessageAt(s.threadListItem.custom),
  );
  const label = formatRelativeConversationTime(lastMessageAt);

  if (!label) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        最近对话：{label}
      </TooltipContent>
    </Tooltip>
  );
};
