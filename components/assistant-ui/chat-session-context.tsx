"use client";

import {
  createContext,
  useContext,
  type FC,
  type ReactNode,
} from "react";

type ChatSessionContextValue = {
  onComposerSubmit?: () => void;
};

const ChatSessionContext = createContext<ChatSessionContextValue>({});

export const ChatSessionProvider: FC<{
  children: ReactNode;
  onComposerSubmit?: () => void;
}> = ({ children, onComposerSubmit }) => (
  <ChatSessionContext.Provider value={{ onComposerSubmit }}>
    {children}
  </ChatSessionContext.Provider>
);

export function useChatSession() {
  return useContext(ChatSessionContext);
}
