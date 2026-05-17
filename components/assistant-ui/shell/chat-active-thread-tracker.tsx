"use client";

import { useAuiState } from "@assistant-ui/store";
import { useEffect, type FC } from "react";
import type { ChatAiProvider } from "@/lib/chat/provider";
import { setLastActiveThreadId } from "@/lib/chat/session-storage";

type ChatActiveThreadTrackerProps = {
  userId: string;
  provider: ChatAiProvider;
};

export const ChatActiveThreadTracker: FC<ChatActiveThreadTrackerProps> = ({
  userId,
  provider,
}) => {
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);

  useEffect(() => {
    if (remoteId) {
      setLastActiveThreadId(userId, provider, remoteId);
    }
  }, [userId, provider, remoteId]);

  return null;
};
