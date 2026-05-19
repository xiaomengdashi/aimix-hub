import { tavily } from "@tavily/core";
import type { TavilySearchResponse } from "@tavily/core";
import type { UIMessage } from "ai";
import { extractLastUserMessageText } from "@/lib/chat/extract-user-text";
import { getTavilyClientConfig } from "@/lib/tavily/env";

function formatSearchContext(
  query: string,
  response: TavilySearchResponse,
): string {
  const sections: string[] = [
    "## Web search results (Tavily)",
    `Search query: ${query}`,
    `Response time: ${response.responseTime}s`,
  ];

  if (response.answer?.trim()) {
    sections.push("", "### Summary", response.answer.trim());
  }

  if (response.results.length > 0) {
    sections.push("", "### Sources");
    for (const result of response.results) {
      sections.push(
        "",
        `#### ${result.title}`,
        `URL: ${result.url}`,
        result.content.trim(),
      );
    }
  }

  return sections.join("\n");
}

export function getPrefetchSearchSystemPrompt(searchContext: string): string {
  return `You have fresh web search results for the user's latest message (below). Use them to answer accurately and cite source URLs when relevant. For date/time questions, prefer facts from the search summary. If results are thin, say what you found and what remains uncertain.

${searchContext}`;
}

/** 对用户最新一条消息执行 Tavily 搜索，返回可注入 system 的上下文 */
export async function prefetchTavilySearchContext(
  messages: UIMessage[],
): Promise<string> {
  const config = getTavilyClientConfig();
  if (!config) {
    throw new Error("TAVILY_API_KEY 未配置");
  }

  const query = extractLastUserMessageText(messages);
  if (!query) {
    throw new Error("无法从消息中提取搜索关键词");
  }

  const client = tavily({
    apiKey: config.apiKey,
    ...(config.apiBaseURL ? { apiBaseURL: config.apiBaseURL } : {}),
  });

  const response = await client.search(query, {
    searchDepth: "advanced",
    includeAnswer: true,
    maxResults: 5,
  });

  return formatSearchContext(query, response);
}
