"use client";

import { useAuiState } from "@assistant-ui/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type FC } from "react";
import type { AppId } from "@/lib/chat/app-id";
import { setLastActiveThreadId } from "@/lib/chat/session-storage";
import { threadIdFromPathname, threadPath } from "@/lib/chat/routes";

type ChatThreadUrlSyncProps = {
  userId: string;
  appId: AppId;
};

/**
 * Promotes `/provider` → `/provider/{id}` when a new thread receives its remote id.
 * Does not rewrite URLs that already contain a thread id (sidebar / back / forward own those).
 */
export const ChatThreadUrlSync: FC<ChatThreadUrlSyncProps> = ({
  userId,
  appId,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const isThreadLoading = useAuiState((s) => s.thread.isLoading);
  const urlThreadId = threadIdFromPathname(pathname);

  useEffect(() => {
    if (remoteId) {
      setLastActiveThreadId(userId, appId, remoteId);
    }
  }, [userId, appId, remoteId]);

  useEffect(() => {
    if (!remoteId || isThreadLoading || urlThreadId) return;

    const targetPath = threadPath(appId, remoteId);
    if (pathname !== targetPath) {
      router.replace(targetPath);
    }
  }, [appId, isThreadLoading, pathname, remoteId, router, urlThreadId]);

  return null;
};
