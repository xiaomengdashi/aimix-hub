import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminIntegrationSettings,
  ManagedModelConfig,
  ModelCatalogInput,
} from "@/lib/admin/types";
import {
  invalidateModelCatalogCache,
} from "@/lib/chat/model-catalog";
import { invalidateIntegrationSettingsCache } from "@/lib/admin/server-integration-settings";

type IntegrationSettingsRow = {
  aiBaseUrl: string;
  aiApiKeyConfigured: boolean;
  aiApiKeyHint: string | null;
  tavilyApiKeyConfigured: boolean;
  tavilyApiKeyHint: string | null;
  tavilyBaseUrl: string;
  updatedAt: string | null;
};

type ModelCatalogRow = {
  model_id: string;
  ui_provider: string;
  enabled: boolean;
  sort_order: number;
  name: string;
  description: string;
  context_window: number;
  backend: string;
  api_model: string;
  input_price_per_million: number | string | null;
  output_price_per_million: number | string | null;
  updated_at: string;
};

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getAdminIntegrationSettings(
  supabase: SupabaseClient,
): Promise<AdminIntegrationSettings> {
  const { data, error } = await supabase.rpc("admin_get_integration_settings");
  if (error) {
    throw new Error(error.message);
  }

  const row = data as IntegrationSettingsRow;
  return {
    aiBaseUrl: row.aiBaseUrl,
    aiApiKeyConfigured: row.aiApiKeyConfigured,
    aiApiKeyHint: row.aiApiKeyHint,
    tavilyApiKeyConfigured: row.tavilyApiKeyConfigured,
    tavilyApiKeyHint: row.tavilyApiKeyHint,
    tavilyBaseUrl: row.tavilyBaseUrl,
    updatedAt: row.updatedAt,
  };
}

export async function updateAdminIntegrationSettings(
  supabase: SupabaseClient,
  input: {
    aiBaseUrl: string;
    aiApiKey?: string | null;
    tavilyApiKey?: string | null;
    tavilyBaseUrl?: string | null;
  },
): Promise<AdminIntegrationSettings> {
  const { data, error } = await supabase.rpc("admin_update_integration_settings", {
    p_ai_base_url: input.aiBaseUrl,
    p_ai_api_key: input.aiApiKey ?? null,
    p_tavily_api_key: input.tavilyApiKey ?? null,
    p_tavily_base_url: input.tavilyBaseUrl ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  invalidateIntegrationSettingsCache();
  invalidateModelCatalogCache();

  const row = data as IntegrationSettingsRow;
  return {
    aiBaseUrl: row.aiBaseUrl,
    aiApiKeyConfigured: row.aiApiKeyConfigured,
    aiApiKeyHint: row.aiApiKeyHint,
    tavilyApiKeyConfigured: row.tavilyApiKeyConfigured,
    tavilyApiKeyHint: row.tavilyApiKeyHint,
    tavilyBaseUrl: row.tavilyBaseUrl,
    updatedAt: row.updatedAt,
  };
}

export async function listManagedModels(
  supabase: SupabaseClient,
): Promise<ManagedModelConfig[]> {
  const { data, error } = await supabase.rpc("admin_list_model_catalog");
  if (error) {
    throw new Error(error.message);
  }

  return ((data as ModelCatalogRow[] | null) ?? []).map((row) => ({
    modelId: row.model_id,
    uiProvider: row.ui_provider as ManagedModelConfig["uiProvider"],
    enabled: row.enabled,
    sortOrder: row.sort_order,
    name: row.name,
    description: row.description,
    contextWindow: row.context_window,
    backend: row.backend as ManagedModelConfig["backend"],
    apiModel: row.api_model,
    inputPricePerMillion: toNullableNumber(row.input_price_per_million),
    outputPricePerMillion: toNullableNumber(row.output_price_per_million),
    updatedAt: row.updated_at,
  }));
}

export async function saveManagedModels(
  supabase: SupabaseClient,
  models: ModelCatalogInput[],
): Promise<void> {
  const payload = models.map((model) => ({
    modelId: model.modelId,
    uiProvider: model.uiProvider,
    enabled: model.enabled,
    sortOrder: model.sortOrder,
    name: model.name,
    description: model.description,
    contextWindow: model.contextWindow,
    backend: model.backend,
    apiModel: model.apiModel,
    inputPricePerMillion: model.inputPricePerMillion,
    outputPricePerMillion: model.outputPricePerMillion,
  }));

  const { error } = await supabase.rpc("admin_save_model_catalog", {
    p_models: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  invalidateModelCatalogCache();
}
