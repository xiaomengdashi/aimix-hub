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
  FALLBACK_CHAT_MODELS,
  getDefaultModelIdForProvider,
  setClientChatModels,
  type ChatModel,
} from "@/lib/chat/models";
import {
  resolveInitialModelId,
  setStoredModelForProvider,
} from "@/lib/chat/model-storage";
import {
  selectedChatModel,
  selectedChatUiProvider,
} from "@/lib/chat/transport";

type ModelsApiResponse = {
  models: ChatModel[];
  source?: string;
  error?: string;
};

type ChatModelContextValue = {
  model: string;
  setModel: (model: string) => void;
  uiProvider: ChatAiProvider;
  models: ChatModel[];
  modelsLoading: boolean;
  modelsSource: "gateway" | "fallback" | "pending";
};

const ChatModelContext = createContext<ChatModelContextValue | null>(null);

function pickInitialModel(
  uiProvider: ChatAiProvider,
  models: ChatModel[],
  preferId?: string,
): string {
  const allowed = new Set(
    models.filter((m) => m.uiProvider === uiProvider).map((m) => m.id),
  );
  if (preferId && allowed.has(preferId)) return preferId;
  const stored = resolveInitialModelId(uiProvider);
  if (stored && allowed.has(stored)) return stored;
  const first = models.find((m) => m.uiProvider === uiProvider)?.id;
  return first ?? getDefaultModelIdForProvider(uiProvider);
}

export const ChatModelProvider: FC<{
  uiProvider: ChatAiProvider;
  children: ReactNode;
}> = ({ uiProvider, children }) => {
  const [models, setModels] = useState<ChatModel[]>(FALLBACK_CHAT_MODELS);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsSource, setModelsSource] = useState<
    "gateway" | "fallback" | "pending"
  >("pending");
  const [model, setModelState] = useState(() =>
    pickInitialModel(uiProvider, FALLBACK_CHAT_MODELS),
  );

  useEffect(() => {
    selectedChatUiProvider.value = uiProvider;
  }, [uiProvider]);

  useEffect(() => {
    selectedChatModel.value = model;
  }, [model]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setModelsLoading(true);
      try {
        const res = await fetch("/api/models", { cache: "no-store" });
        const data = (await res.json()) as ModelsApiResponse;
        if (cancelled) return;

        const nextModels = data.models?.length
          ? data.models
          : FALLBACK_CHAT_MODELS;
        setClientChatModels(nextModels);
        setModels(nextModels);
        setModelsSource(data.source === "gateway" ? "gateway" : "fallback");

        const initial = pickInitialModel(uiProvider, nextModels, model);
        selectedChatModel.value = initial;
        setModelState(initial);
      } catch {
        if (cancelled) return;
        setClientChatModels(FALLBACK_CHAT_MODELS);
        setModels(FALLBACK_CHAT_MODELS);
        setModelsSource("fallback");
        const initial = pickInitialModel(uiProvider, FALLBACK_CHAT_MODELS, model);
        selectedChatModel.value = initial;
        setModelState(initial);
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [uiProvider]);

  const setModel = useCallback(
    (next: string) => {
      const allowed = models.some(
        (m) => m.uiProvider === uiProvider && m.id === next,
      );
      if (!allowed) return;
      selectedChatModel.value = next;
      setStoredModelForProvider(uiProvider, next);
      setModelState(next);
    },
    [uiProvider, models],
  );

  const value = useMemo(
    () => ({
      model,
      setModel,
      uiProvider,
      models: models.filter((m) => m.uiProvider === uiProvider),
      modelsLoading,
      modelsSource,
    }),
    [model, setModel, uiProvider, models, modelsLoading, modelsSource],
  );

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
