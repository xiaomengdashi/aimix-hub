"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { useChatModel } from "@/components/assistant-ui/contexts/chat-model-context";
import type { ChatAiProvider } from "@/lib/chat/provider";
import {
  getComposerTool,
  type ComposerToolId,
} from "@/lib/chat/composer-tools";
import { isImageGenerationModel } from "@/lib/image-generation/models";
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
  const { model, setModel, models } = useChatModel();
  const [tool, setToolState] = useState<ComposerToolId | null>(null);
  const modelBeforeToolRef = useRef<string | null>(null);

  const clearTool = useCallback(() => {
    setToolState(null);
    selectedComposerTool.value = null;
    const saved = modelBeforeToolRef.current;
    modelBeforeToolRef.current = null;
    if (saved && saved !== model) {
      setModel(saved);
    }
  }, [model, setModel]);

  const applyTool = useCallback(
    (next: ComposerToolId) => {
      const def = getComposerTool(next);
      setToolState(next);
      selectedComposerTool.value = next;

      if (def.modelId) {
        const hasModel = models.some((m) => m.id === def.modelId);
        if (hasModel) {
          if (!isImageGenerationModel(model)) {
            modelBeforeToolRef.current = model;
          }
          setModel(def.modelId);
        }
      } else if (isImageGenerationModel(model) && modelBeforeToolRef.current) {
        setModel(modelBeforeToolRef.current);
        modelBeforeToolRef.current = null;
      }
    },
    [model, models, setModel],
  );

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
    modelBeforeToolRef.current = null;
  }, [uiProvider]);

  useEffect(() => {
    if (!tool) return;
    const def = getComposerTool(tool);
    if (!def.modelId) return;
    if (model === def.modelId) return;
    if (!isImageGenerationModel(model)) {
      clearTool();
    }
  }, [model, tool, clearTool]);

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
