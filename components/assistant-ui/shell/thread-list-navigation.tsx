"use client";

import { useAuiState } from "@assistant-ui/store";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, type FC, type ReactNode } from "react";
import { useAppNav } from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { appPath, threadIdFromPathname, threadPath } from "@/lib/chat/routes";

export function useThreadListNavigation() {
  const router = useRouter();
  const { appId } = useAppNav();

  const navigateToNewThread = useCallback(() => {
    router.replace(appPath(appId));
  }, [router, appId]);

  const navigateToThread = useCallback(
    (threadId: string) => {
      router.replace(threadPath(appId, threadId));
    },
    [router, appId],
  );

  return { navigateToNewThread, navigateToThread };
}

/** Navigates to `/provider` when leaving a thread URL; runtime follows via `ThreadListPrimitive.New`. */
export function useThreadListNewClickHandler() {
  const pathname = usePathname();
  const { navigateToNewThread } = useThreadListNavigation();

  return useCallback(() => {
    if (threadIdFromPathname(pathname)) {
      navigateToNewThread();
    }
  }, [navigateToNewThread, pathname]);
}

type ThreadListItemNavTriggerProps = {
  className?: string;
  children: ReactNode;
};

/** URL-first thread item: updates the address bar only; runtime follows via ChatDeferredThreadSwitch. */
export const ThreadListItemNavTrigger: FC<ThreadListItemNavTriggerProps> = ({
  className,
  children,
}) => {
  const { navigateToThread } = useThreadListNavigation();
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);

  const onClick = useCallback(() => {
    if (remoteId) navigateToThread(remoteId);
  }, [navigateToThread, remoteId]);

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
};
