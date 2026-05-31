/** Tavily 客户端选项（来自后台 integration_settings） */
export type TavilyClientConfig = {
  apiKey: string;
  apiBaseURL?: string;
};

export async function getTavilyClientConfig(): Promise<TavilyClientConfig | null> {
  const { getServerIntegrationSettings } = await import(
    "@/lib/admin/server-integration-settings"
  );
  const settings = await getServerIntegrationSettings();
  if (!settings?.tavilyApiKey) return null;

  return settings.tavilyBaseUrl
    ? { apiKey: settings.tavilyApiKey, apiBaseURL: settings.tavilyBaseUrl }
    : { apiKey: settings.tavilyApiKey };
}

export async function isTavilyConfigured(): Promise<boolean> {
  const config = await getTavilyClientConfig();
  return config !== null;
}
