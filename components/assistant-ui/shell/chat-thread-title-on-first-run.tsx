"use client";

import { useAui, useAuiState } from "@assistant-ui/store";
import { useEffect, useRef, type FC } from "react";

/**
 * Ensures the first completed run on an untitled thread triggers title generation.
 * Backup for assistant-ui's internal runEnd hook, which can be missed after URL sync.
 */
export const ChatThreadTitleOnFirstRun: FC = () => {
  const aui = useAui();
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const title = useAuiState((s) => s.threadListItem.title);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const wasRunningRef = useRef(false);
  const generatedForRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    generatedForRef.current = undefined;
  }, [remoteId]);

  useEffect(() => {
    if (isRunning) {
      wasRunningRef.current = true;
      return;
    }

    if (!wasRunningRef.current || !remoteId || title) return;
    if (generatedForRef.current === remoteId) return;

    wasRunningRef.current = false;
    generatedForRef.current = remoteId;
    aui.threadListItem().generateTitle();
  }, [aui, isRunning, remoteId, title]);

  return null;
};
