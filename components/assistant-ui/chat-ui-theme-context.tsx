"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from "react";
import {
  DEFAULT_CHAT_UI_THEME,
  getStoredChatUiTheme,
  setStoredChatUiTheme,
  type ChatUiTheme,
} from "@/lib/chat-ui-theme";

type ChatUiThemeContextValue = {
  theme: ChatUiTheme;
  setTheme: (theme: ChatUiTheme) => void;
};

const ChatUiThemeContext = createContext<ChatUiThemeContextValue | null>(null);

export const ChatUiThemeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ChatUiTheme>(
    () => getStoredChatUiTheme() ?? DEFAULT_CHAT_UI_THEME,
  );

  const setTheme = useCallback((next: ChatUiTheme) => {
    setStoredChatUiTheme(next);
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ChatUiThemeContext.Provider value={value}>
      {children}
    </ChatUiThemeContext.Provider>
  );
};

export function useChatUiTheme() {
  const ctx = useContext(ChatUiThemeContext);
  if (!ctx) {
    throw new Error("useChatUiTheme must be used within ChatUiThemeProvider");
  }
  return ctx;
}
