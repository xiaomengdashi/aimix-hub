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
import {
  FALLBACK_CHAT_MODELS,
  getClientChatModels,
  getClientChatModelsSource,
  getDefaultModelIdForScope,
  hasClientChatModelsLoaded,
  setClientChatModels,
  type ChatModel,
  type ModelUiScope,
} from "@/lib/chat/models";
import {
  resolveInitialModelId,
  setStoredModelForScope,
} from "@/lib/chat/model-storage";
import {
  selectedChatModel,
  selectedChatUiProvider,
} from "@/lib/chat/transport";
import { IMAGE_GENERATION_MODEL_ID } from "@/lib/image-generation/constants";

type ModelsApiResponse = {
  models: ChatModel[];
  source?: string;
  error?: string;
};

type ChatModelContextValue = {
  model: string;
  setModel: (model: string) => void;
  uiScope: ModelUiScope;
  /** @deprecated 使用 uiScope */
  uiProvider: ModelUiScope;
  models: ChatModel[];
  modelsLoading: boolean;
  modelsSource: "catalog" | "fallback" | "pending";
};

const ChatModelContext = createContext<ChatModelContextValue | null>(null);

function pickInitialModel(
  uiScope: ModelUiScope,
  models: ChatModel[],
  preferId?: string,
): string {
  if (uiScope === "image") return IMAGE_GENERATION_MODEL_ID;
  const allowed = new Set(
    models.filter((m) => m.uiProvider === uiScope).map((m) => m.id),
  );
  if (preferId && allowed.has(preferId)) return preferId;
  const stored = resolveInitialModelId(uiScope);
  if (stored && allowed.has(stored)) return stored;
  const first = models.find((m) => m.uiProvider === uiScope)?.id;
  return first ?? getDefaultModelIdForScope(uiScope);
}

export const ChatModelProvider: FC<{
  uiScope: ModelUiScope;
  children: ReactNode;
}> = ({ uiScope, children }) => {
  const [models, setModels] = useState<ChatModel[]>(() => getClientChatModels());
  const [modelsLoading, setModelsLoading] = useState(
    () => !hasClientChatModelsLoaded(),
  );
  const [modelsSource, setModelsSource] = useState<
    "catalog" | "fallback" | "pending"
  >(() =>
    hasClientChatModelsLoaded() ? getClientChatModelsSource() : "pending",
  );
  const [model, setModelState] = useState(() =>
    pickInitialModel(uiScope, FALLBACK_CHAT_MODELS),
  );

  useEffect(() => {
    selectedChatUiProvider.value = uiScope;
  }, [uiScope]);

  useEffect(() => {
    selectedChatModel.value = model;
  }, [model]);

  useEffect(() => {
    if (hasClientChatModelsLoaded()) {
      const cached = getClientChatModels();
      setModels(cached);
      setModelsSource(getClientChatModelsSource());
      setModelsLoading(false);
      const initial = pickInitialModel(uiScope, cached, model);
      selectedChatModel.value = initial;
      setModelState(initial);
      return;
    }

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
        const source = data.source === "catalog" ? "catalog" : "fallback";
        setClientChatModels(nextModels, source);
        setModels(nextModels);
        setModelsSource(source);

        const initial = pickInitialModel(uiScope, nextModels, model);
        selectedChatModel.value = initial;
        setModelState(initial);
      } catch {
        if (cancelled) return;
        setClientChatModels(FALLBACK_CHAT_MODELS, "fallback");
        setModels(FALLBACK_CHAT_MODELS);
        setModelsSource("fallback");
        const initial = pickInitialModel(uiScope, FALLBACK_CHAT_MODELS, model);
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
  }, [uiScope]);

  useEffect(() => {
    if (uiScope !== "image") return;
    if (model === IMAGE_GENERATION_MODEL_ID) return;
    selectedChatModel.value = IMAGE_GENERATION_MODEL_ID;
    setModelState(IMAGE_GENERATION_MODEL_ID);
  }, [uiScope, model]);

  const setModel = useCallback(
    (next: string) => {
      if (uiScope === "image") return;
      const allowed = models.some(
        (m) => m.uiProvider === uiScope && m.id === next,
      );
      if (!allowed) return;
      selectedChatModel.value = next;
      setStoredModelForScope(uiScope, next);
      setModelState(next);
    },
    [uiScope, models],
  );

  const value = useMemo(
    () => ({
      model,
      setModel,
      uiScope,
      uiProvider: uiScope,
      models: models.filter((m) => m.uiProvider === uiScope),
      modelsLoading,
      modelsSource,
    }),
    [model, setModel, uiScope, models, modelsLoading, modelsSource],
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
