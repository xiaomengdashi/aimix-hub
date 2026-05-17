"use client";

import { useAuiState } from "@assistant-ui/store";
import { useEffect, type FC } from "react";
import { setLastActiveThreadId } from "@/lib/chat-session-storage";

type ChatActiveThreadTrackerProps = {
  userId: string;
};

export const ChatActiveThreadTracker: FC<ChatActiveThreadTrackerProps> = ({
  userId,
}) => {
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);

  useEffect(() => {
    if (remoteId) {
      setLastActiveThreadId(userId, remoteId);
    }
  }, [userId, remoteId]);

  return null;
};
