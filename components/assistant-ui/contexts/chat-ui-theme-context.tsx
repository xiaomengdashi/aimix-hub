"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { type AppId, setStoredAppId } from "@/lib/chat/app-id";
import { appFromPathname, appPath } from "@/lib/chat/routes";

type AppNavContextValue = {
  appId: AppId;
  setAppId: (appId: AppId) => void;
  /** @deprecated 使用 appId */
  provider: AppId;
  /** @deprecated 使用 setAppId */
  setProvider: (appId: AppId) => void;
};

const AppNavContext = createContext<AppNavContextValue | null>(null);

export const ChatAiProviderProvider: FC<{
  children: ReactNode;
  initialProvider: AppId;
}> = ({ children, initialProvider }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [appId, setAppIdState] = useState<AppId>(initialProvider);

  useEffect(() => {
    setAppIdState(initialProvider);
    setStoredAppId(initialProvider);
  }, [initialProvider]);

  useEffect(() => {
    const fromPath = appFromPathname(pathname);
    if (!fromPath || fromPath === appId) return;
    setStoredAppId(fromPath);
    setAppIdState(fromPath);
  }, [pathname, appId]);

  const setAppId = useCallback(
    (next: AppId) => {
      if (next === appId) return;
      setStoredAppId(next);
      setAppIdState(next);
      router.push(appPath(next));
    },
    [appId, router],
  );

  const value = useMemo(
    () => ({
      appId,
      setAppId,
      provider: appId,
      setProvider: setAppId,
    }),
    [appId, setAppId],
  );

  return (
    <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>
  );
};

/** @deprecated Use ChatAiProviderProvider */
export const ChatUiThemeProvider = ChatAiProviderProvider;

export function useAppNav() {
  const ctx = useContext(AppNavContext);
  if (!ctx) {
    throw new Error("useAppNav must be used within ChatAiProviderProvider");
  }
  return ctx;
}

export function useChatAiProvider() {
  return useAppNav();
}

/** @deprecated Use useAppNav */
export function useChatUiTheme() {
  const { appId, setAppId } = useAppNav();
  return { theme: appId, setTheme: setAppId };
}
