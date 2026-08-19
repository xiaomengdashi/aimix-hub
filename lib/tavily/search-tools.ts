import { tavilySearch } from "@tavily/ai-sdk";
import { getTavilyClientConfig } from "@/lib/tavily/env";

const SEARCH_TOOL_SYSTEM = `You have a web_search tool for live web results. When the user needs current facts, news, prices, or anything time-sensitive:
1. Call web_search with a focused query.
2. Synthesize findings with clear headings.
3. Cite source URLs from the tool output.
If search returns little, say what you found and what remains uncertain.`;

export function getSearchToolSystemPrompt(): string {
  return SEARCH_TOOL_SYSTEM;
}

/** 为 AI SDK 创建 Tavily 搜索工具；未配置 API key 时返回 null */
export async function createTavilySearchTools(options?: {
  maxResults?: number;
}) {
  const client = await getTavilyClientConfig();
  if (!client) return null;

  return {
    web_search: tavilySearch({
      apiKey: client.apiKey,
      ...(client.apiBaseURL ? { apiBaseURL: client.apiBaseURL } : {}),
      searchDepth: "advanced",
      includeAnswer: true,
      maxResults: options?.maxResults ?? 5,
    }),
  } as const;
}
