import type { ChatModel, ModelUiScope } from "@/lib/chat/models";
import { FALLBACK_CHAT_MODELS } from "@/lib/chat/models";
import { applyModelDisplayList } from "@/lib/ai-gateway/model-display";
import {
  invalidateIntegrationSettingsCache,
  readModelCatalogRows,
} from "@/lib/admin/server-integration-settings";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

const CACHE_TTL_MS = 60_000;

type CatalogRow = {
  model_id: string;
  ui_provider: string;
  enabled: boolean;
  sort_order: number;
  name: string;
  description: string;
  context_window: number;
  backend: string;
  api_model: string;
};

let enabledCache: { at: number; models: ChatModel[] } | null = null;
let allCache: { at: number; models: ChatModel[] } | null = null;

function rowToChatModel(row: CatalogRow): ChatModel {
  return {
    id: row.model_id,
    name: row.name,
    description: row.description,
    contextWindow: row.context_window,
    uiProvider: row.ui_provider as ModelUiScope,
    backend: row.backend as ChatModel["backend"],
    apiModel: row.api_model,
  };
}

export function invalidateModelCatalogCache(): void {
  enabledCache = null;
  allCache = null;
  invalidateIntegrationSettingsCache();
}

export async function getEnabledModelCatalog(): Promise<ChatModel[]> {
  if (enabledCache && Date.now() - enabledCache.at < CACHE_TTL_MS) {
    return enabledCache.models;
  }

  try {
    if (!isAdminClientConfigured() && !process.env.SUPABASE_SERVER_READ_TOKEN?.trim()) {
      return applyModelDisplayList(FALLBACK_CHAT_MODELS);
    }

    const rows = await readModelCatalogRows({ enabledOnly: true });
    if (rows.length === 0) {
      return applyModelDisplayList(FALLBACK_CHAT_MODELS);
    }

    const models = applyModelDisplayList(rows.map(rowToChatModel));
    enabledCache = { at: Date.now(), models };
    return models;
  } catch {
    return applyModelDisplayList(FALLBACK_CHAT_MODELS);
  }
}

export async function getAllModelCatalog(): Promise<ChatModel[]> {
  if (allCache && Date.now() - allCache.at < CACHE_TTL_MS) {
    return allCache.models;
  }

  const rows = await readModelCatalogRows({ enabledOnly: false });
  const models = applyModelDisplayList(rows.map(rowToChatModel));
  allCache = { at: Date.now(), models };
  return models;
}
