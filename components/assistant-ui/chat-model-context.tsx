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
import { DEFAULT_CHAT_MODEL_ID } from "@/lib/chat-models";
import { selectedChatModel } from "@/lib/chat-transport";

type ChatModelContextValue = {
  model: string;
  setModel: (model: string) => void;
};

const ChatModelContext = createContext<ChatModelContextValue | null>(null);

export const ChatModelProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [model, setModelState] = useState(
    () => selectedChatModel.value || DEFAULT_CHAT_MODEL_ID,
  );

  const setModel = useCallback((next: string) => {
    selectedChatModel.value = next;
    setModelState(next);
  }, []);

  const value = useMemo(() => ({ model, setModel }), [model, setModel]);

  return (
    <ChatModelContext.Provider value={value}>
      {children}
    </ChatModelContext.Provider>
  );
};

export function useChatModel() {
  const ctx = useContext(ChatModelContext);
  if (!ctx) {
    throw new Error("useChatModel must be used within ChatModelProvider");
  }
  return ctx;
}
