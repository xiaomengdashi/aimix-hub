"use client";

import { useAui, useAuiState } from "@assistant-ui/store";
import { useEffect, useRef, type FC } from "react";

type ChatDeferredThreadSwitchProps = {
  threadId?: string;
};

/**
 * Applies URL thread id to the runtime after the list has loaded.
 * URL is the source of truth for switching between existing sessions.
 */
export const ChatDeferredThreadSwitch: FC<ChatDeferredThreadSwitchProps> = ({
  threadId,
}) => {
  const aui = useAui();
  const threadsLoading = useAuiState((s) => s.threads.isLoading);
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const appliedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (threadsLoading) return;

    const targetKey = threadId ?? "__new__";
    if (appliedRef.current === targetKey) return;

    if (threadId) {
      if (remoteId === threadId) {
        appliedRef.current = targetKey;
        return;
      }
      appliedRef.current = targetKey;
      aui.threads().switchToThread(threadId);
      return;
    }

    appliedRef.current = targetKey;
    aui.threads().switchToNewThread();
  }, [aui, remoteId, threadId, threadsLoading]);

  return null;
};
