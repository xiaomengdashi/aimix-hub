"use client";

import { MessagePrimitive } from "@assistant-ui/react";
import { useAuiState } from "@assistant-ui/store";
import type { ComponentProps, FC } from "react";
import { buildThreadQuestionAnchorId } from "@/lib/chat/thread-question-outline";
import { cn } from "@/lib/utils";

type ThreadUserMessageRootProps = ComponentProps<typeof MessagePrimitive.Root>;

/** 用户消息的 MessagePrimitive.Root，带目录锚点 id */
export const ThreadUserMessageRoot: FC<ThreadUserMessageRootProps> = ({
  className,
  ...props
}) => {
  const messageId = useAuiState((s) => s.message.id);

  return (
    <MessagePrimitive.Root
      {...props}
      id={buildThreadQuestionAnchorId(messageId)}
      className={cn("scroll-mt-20", className)}
      data-role="user"
    />
  );
};
