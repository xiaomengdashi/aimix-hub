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
import {
  setStoredChatAiProvider,
  type ChatAiProvider,
} from "@/lib/chat/provider";
import {
  providerFromPathname,
  providerPath,
} from "@/lib/chat/routes";

type ChatAiProviderContextValue = {
  provider: ChatAiProvider;
  setProvider: (provider: ChatAiProvider) => void;
};

const ChatAiProviderContext = createContext<ChatAiProviderContextValue | null>(
  null,
);

export const ChatAiProviderProvider: FC<{
  children: ReactNode;
  initialProvider: ChatAiProvider;
}> = ({ children, initialProvider }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [provider, setProviderState] = useState<ChatAiProvider>(initialProvider);

  useEffect(() => {
    setProviderState(initialProvider);
    setStoredChatAiProvider(initialProvider);
  }, [initialProvider]);

  useEffect(() => {
    const fromPath = providerFromPathname(pathname);
    if (!fromPath || fromPath === provider) return;
    setStoredChatAiProvider(fromPath);
    setProviderState(fromPath);
  }, [pathname, provider]);

  const setProvider = useCallback(
    (next: ChatAiProvider) => {
      if (next === provider) return;
      setStoredChatAiProvider(next);
      setProviderState(next);
      router.push(providerPath(next));
    },
    [provider, router],
  );

  const value = useMemo(
    () => ({ provider, setProvider }),
    [provider, setProvider],
  );

  return (
    <ChatAiProviderContext.Provider value={value}>
      {children}
    </ChatAiProviderContext.Provider>
  );
};

/** @deprecated Use ChatAiProviderProvider */
export const ChatUiThemeProvider = ChatAiProviderProvider;

export function useChatAiProvider() {
  const ctx = useContext(ChatAiProviderContext);
  if (!ctx) {
    throw new Error(
      "useChatAiProvider must be used within ChatAiProviderProvider",
    );
  }
  return ctx;
}

/** @deprecated Use useChatAiProvider */
export function useChatUiTheme() {
  const { provider, setProvider } = useChatAiProvider();
  return { theme: provider, setTheme: setProvider };
}
