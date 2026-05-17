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
import type { ChatModeId } from "@/lib/chat-modes";
import { getChatMode } from "@/lib/chat-modes";
import { selectedChatMode } from "@/lib/chat-transport";

const CHAT_MODE_STORAGE_KEY = "claude-clone:chat-mode";

function readStoredMode(): ChatModeId | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CHAT_MODE_STORAGE_KEY);
  if (!stored) return null;
  return getChatMode(stored as ChatModeId) ? (stored as ChatModeId) : null;
}

type ChatModeContextValue = {
  mode: ChatModeId | null;
  setMode: (mode: ChatModeId | null) => void;
  activeMode: ReturnType<typeof getChatMode>;
};

const ChatModeContext = createContext<ChatModeContextValue | null>(null);

export const ChatModeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ChatModeId | null>(() => {
    const stored = readStoredMode();
    selectedChatMode.value = stored;
    return stored;
  });

  const setMode = useCallback((next: ChatModeId | null) => {
    selectedChatMode.value = next;
    setModeState(next);
    if (typeof window === "undefined") return;
    if (next) {
      localStorage.setItem(CHAT_MODE_STORAGE_KEY, next);
    } else {
      localStorage.removeItem(CHAT_MODE_STORAGE_KEY);
    }
  }, []);

  const activeMode = useMemo(
    () => (mode ? getChatMode(mode) : undefined),
    [mode],
  );

  const value = useMemo(
    () => ({ mode, setMode, activeMode }),
    [mode, setMode, activeMode],
  );

  return (
    <ChatModeContext.Provider value={value}>
      {children}
    </ChatModeContext.Provider>
  );
};

export function useChatMode() {
  const ctx = useContext(ChatModeContext);
  if (!ctx) {
    throw new Error("useChatMode must be used within ChatModeProvider");
  }
  return ctx;
}
