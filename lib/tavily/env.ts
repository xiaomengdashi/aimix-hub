/** Tavily 客户端选项（来自环境变量） */
export type TavilyClientConfig = {
  apiKey: string;
  apiBaseURL?: string;
};

export function getTavilyClientConfig(): TavilyClientConfig | null {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return null;

  const apiBaseURL = process.env.TAVILY_BASE_URL?.trim();
  return apiBaseURL ? { apiKey, apiBaseURL } : { apiKey };
}

export function isTavilyConfigured(): boolean {
  return getTavilyClientConfig() !== null;
}
