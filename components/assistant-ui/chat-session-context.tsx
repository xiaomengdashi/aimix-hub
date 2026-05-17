"use client";

import {
  createContext,
  useContext,
  type FC,
  type ReactNode,
} from "react";

type ChatSessionContextValue = {
  onComposerSubmit?: () => void;
  onAttachmentError?: (message: string) => void;
};

const ChatSessionContext = createContext<ChatSessionContextValue>({});

export const ChatSessionProvider: FC<{
  children: ReactNode;
  onComposerSubmit?: () => void;
  onAttachmentError?: (message: string) => void;
}> = ({ children, onComposerSubmit, onAttachmentError }) => (
  <ChatSessionContext.Provider value={{ onComposerSubmit, onAttachmentError }}>
    {children}
  </ChatSessionContext.Provider>
);

export function useChatSession() {
  return useContext(ChatSessionContext);
}
