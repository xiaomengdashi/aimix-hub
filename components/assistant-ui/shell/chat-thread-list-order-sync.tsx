"use client";

import { useAui, useAuiState } from "@assistant-ui/store";
import { useEffect, useRef, type FC } from "react";

const BUMP_DEBOUNCE_MS = 250;

/**
 * Keeps the sidebar thread list aligned with `last_message_at` ordering by
 * reloading the remote list after new messages are persisted.
 */
export const ChatThreadListOrderSync: FC = () => {
  const aui = useAui();
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const isThreadLoading = useAuiState((s) => s.thread.isLoading);
  const messageCount = useAuiState((s) => s.thread.messages.length);

  const prevCountRef = useRef<number | null>(null);
  const bumpTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    prevCountRef.current = null;
  }, [remoteId]);

  useEffect(() => {
    return () => {
      if (bumpTimerRef.current !== undefined) {
        clearTimeout(bumpTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!remoteId) return;

    if (isThreadLoading) return;

    if (prevCountRef.current === null) {
      prevCountRef.current = messageCount;
      return;
    }

    if (messageCount <= prevCountRef.current) {
      prevCountRef.current = messageCount;
      return;
    }

    const delta = messageCount - prevCountRef.current;
    if (prevCountRef.current === 0 && delta > 2) {
      prevCountRef.current = messageCount;
      return;
    }

    prevCountRef.current = messageCount;

    if (bumpTimerRef.current !== undefined) {
      clearTimeout(bumpTimerRef.current);
    }

    bumpTimerRef.current = setTimeout(() => {
      bumpTimerRef.current = undefined;
      void aui.threads.reload();
    }, BUMP_DEBOUNCE_MS);
  }, [aui, remoteId, isThreadLoading, messageCount]);

  return null;
};
