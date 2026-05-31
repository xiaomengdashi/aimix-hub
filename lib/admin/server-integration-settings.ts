import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";

export type ServerIntegrationSettings = {
  aiBaseUrl: string;
  aiApiKey: string;
  tavilyApiKey: string;
  tavilyBaseUrl: string;
  updatedAt: string | null;
};

const CACHE_TTL_MS = 60_000;

let cache: { at: number; settings: ServerIntegrationSettings } | null = null;

function normalizeBaseUrl(url: string): string {
  const base = url.replace(/\/$/, "");
  return base.endsWith("/v1") ? base : `${base}/v1`;
}

function rowToSettings(row: {
  ai_base_url?: string;
  ai_api_key?: string;
  tavily_api_key?: string;
  tavily_base_url?: string;
  updated_at?: string | null;
  aiBaseUrl?: string;
  aiApiKey?: string;
  tavilyApiKey?: string;
  tavilyBaseUrl?: string;
  updatedAt?: string | null;
}): ServerIntegrationSettings {
  const aiBaseUrl = row.ai_base_url ?? row.aiBaseUrl ?? "https://yunwu.ai/v1";
  const aiApiKey = row.ai_api_key ?? row.aiApiKey ?? "";
  const tavilyApiKey = row.tavily_api_key ?? row.tavilyApiKey ?? "";
  const tavilyBaseUrl =
    row.tavily_base_url ?? row.tavilyBaseUrl ?? "https://api.tavily.com";
  const updatedAt = row.updated_at ?? row.updatedAt ?? null;

  return {
    aiBaseUrl: normalizeBaseUrl(aiBaseUrl),
    aiApiKey: aiApiKey.trim(),
    tavilyApiKey: tavilyApiKey.trim(),
    tavilyBaseUrl: tavilyBaseUrl.replace(/\/$/, ""),
    updatedAt,
  };
}

function isInvalidApiKeyError(message: string): boolean {
  return /invalid api key/i.test(message);
}

function getPublishableClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase 未配置");
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getServerReadToken(): string | null {
  const token = process.env.SUPABASE_SERVER_READ_TOKEN?.trim();
  return token || null;
}

export function invalidateIntegrationSettingsCache(): void {
  cache = null;
}

async function readViaServiceRole(): Promise<ServerIntegrationSettings | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("integration_settings")
    .select("ai_base_url, ai_api_key, tavily_api_key, tavily_base_url, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return rowToSettings(data);
}

async function readViaServerToken(): Promise<ServerIntegrationSettings | null> {
  const token = getServerReadToken();
  if (!token) return null;

  const supabase = getPublishableClient();
  const { data, error } = await supabase.rpc("server_read_integration_settings", {
    p_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return rowToSettings(data as Record<string, string | null>);
}

export async function getServerIntegrationSettings(): Promise<ServerIntegrationSettings | null> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.settings;
  }

  let settings: ServerIntegrationSettings | null = null;
  let serviceRoleError: string | null = null;

  if (isAdminClientConfigured()) {
    try {
      settings = await readViaServiceRole();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isInvalidApiKeyError(message)) {
        throw error;
      }
      serviceRoleError = message;
    }
  }

  if (!settings) {
    try {
      settings = await readViaServerToken();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (serviceRoleError) {
        throw new Error(
          `Supabase Secret Key 无效（${serviceRoleError}）。请在 Dashboard → Settings → API 复制 legacy「service_role」JWT（eyJ 开头）作为 SUPABASE_SERVICE_ROLE_KEY，或在 .env.local 配置 SUPABASE_SERVER_READ_TOKEN（从管理后台复制）。`,
        );
      }
      throw new Error(message);
    }
  }

  if (!settings && serviceRoleError) {
    throw new Error(
      `Supabase Secret Key 无效。请改用 legacy service_role JWT，或配置 SUPABASE_SERVER_READ_TOKEN。`,
    );
  }

  if (settings) {
    cache = { at: Date.now(), settings };
  }
  return settings;
}

export async function getGatewayCredentials(): Promise<{
  baseUrl: string;
  apiKey: string;
}> {
  const settings = await getServerIntegrationSettings();
  if (!settings?.aiApiKey) {
    throw new Error("AI 网关未配置：请在 /admin/models 设置 Base URL 与 API Key");
  }

  return {
    baseUrl: settings.aiBaseUrl,
    apiKey: settings.aiApiKey,
  };
}

export async function readModelCatalogRows(options?: {
  enabledOnly?: boolean;
}): Promise<
  Array<{
    model_id: string;
    ui_provider: string;
    enabled: boolean;
    sort_order: number;
    name: string;
    description: string;
    context_window: number;
    backend: string;
    api_model: string;
  }>
> {
  const enabledOnly = options?.enabledOnly ?? true;

  if (isAdminClientConfigured()) {
    try {
      const admin = createAdminClient();
      let query = admin
        .from("model_catalog")
        .select(
          "model_id, ui_provider, enabled, sort_order, name, description, context_window, backend, api_model",
        )
        .order("ui_provider", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("model_id", { ascending: true });

      if (enabledOnly) {
        query = query.eq("enabled", true);
      }

      const { data, error } = await query;
      if (error) {
        if (!isInvalidApiKeyError(error.message)) {
          throw new Error(error.message);
        }
      } else {
        return data ?? [];
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isInvalidApiKeyError(message)) {
        throw error;
      }
    }
  }

  const token = getServerReadToken();
  if (!token) {
    return [];
  }

  const supabase = getPublishableClient();
  const { data, error } = await supabase.rpc("server_read_model_catalog", {
    p_token: token,
    p_enabled_only: enabledOnly,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data as typeof data) ?? [];
}
