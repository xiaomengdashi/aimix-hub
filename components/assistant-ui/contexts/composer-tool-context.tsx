"use client";

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
import type { ChatAiProvider } from "@/lib/chat/provider";
import {
  getComposerTool,
  type ComposerToolId,
} from "@/lib/chat/composer-tools";
import { selectedComposerTool } from "@/lib/chat/transport";

type ComposerToolContextValue = {
  tool: ComposerToolId | null;
  setTool: (tool: ComposerToolId | null) => void;
  toggleTool: (tool: ComposerToolId) => void;
  activeTool: ReturnType<typeof getComposerTool> | undefined;
  composerPlaceholder: string | undefined;
  integrationNote: string | undefined;
};

const ComposerToolContext = createContext<ComposerToolContextValue | null>(
  null,
);

const DEFAULT_PLACEHOLDERS: Record<ChatAiProvider, string> = {
  chatgpt: "Ask anything",
  gemini: "Ask Gemini",
  claude: "How can I help you today?",
  other: "Message…",
};

export const ComposerToolProvider: FC<{
  uiProvider: ChatAiProvider;
  children: ReactNode;
}> = ({ uiProvider, children }) => {
  const [tool, setToolState] = useState<ComposerToolId | null>(null);

  const clearTool = useCallback(() => {
    setToolState(null);
    selectedComposerTool.value = null;
  }, []);

  const applyTool = useCallback((next: ComposerToolId) => {
    setToolState(next);
    selectedComposerTool.value = next;
  }, []);

  const setTool = useCallback(
    (next: ComposerToolId | null) => {
      if (next === null) {
        clearTool();
        return;
      }
      applyTool(next);
    },
    [applyTool, clearTool],
  );

  const toggleTool = useCallback(
    (id: ComposerToolId) => {
      if (tool === id) {
        clearTool();
        return;
      }
      applyTool(id);
    },
    [tool, applyTool, clearTool],
  );

  useEffect(() => {
    setToolState(null);
    selectedComposerTool.value = null;
  }, [uiProvider]);

  const activeTool = tool ? getComposerTool(tool) : undefined;

  const composerPlaceholder =
    activeTool?.composerPlaceholder ?? DEFAULT_PLACEHOLDERS[uiProvider];

  const integrationNote = activeTool?.integrationNote;

  const value = useMemo(
    () => ({
      tool,
      setTool,
      toggleTool,
      activeTool,
      composerPlaceholder,
      integrationNote,
    }),
    [tool, setTool, toggleTool, activeTool, composerPlaceholder, integrationNote],
  );

  return (
    <ComposerToolContext.Provider value={value}>
      {children}
    </ComposerToolContext.Provider>
  );
};

export function useComposerTool() {
  const ctx = useContext(ComposerToolContext);
  if (!ctx) {
    throw new Error("useComposerTool must be used within ComposerToolProvider");
  }
  return ctx;
}
