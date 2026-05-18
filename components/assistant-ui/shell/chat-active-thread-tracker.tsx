"use client";

import { useAuiState } from "@assistant-ui/store";
import { useEffect, type FC } from "react";
import type { AppId } from "@/lib/chat/app-id";
import { setLastActiveThreadId } from "@/lib/chat/session-storage";

type ChatActiveThreadTrackerProps = {
  userId: string;
  appId: AppId;
};

export const ChatActiveThreadTracker: FC<ChatActiveThreadTrackerProps> = ({
  userId,
  appId,
}) => {
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);

  useEffect(() => {
    if (remoteId) {
      setLastActiveThreadId(userId, appId, remoteId);
    }
  }, [userId, appId, remoteId]);

  return null;
};
