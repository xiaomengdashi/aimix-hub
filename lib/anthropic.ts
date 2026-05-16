import { createAnthropic } from "@ai-sdk/anthropic";

function normalizeAnthropicBaseUrl(url: string | undefined): string {
  const base = (url ?? "https://yunwu.ai/v1").replace(/\/$/, "");
  return base.endsWith("/v1") ? base : `${base}/v1`;
}

export const anthropic = createAnthropic({
  baseURL: normalizeAnthropicBaseUrl(process.env.ANTHROPIC_BASE_URL),
  apiKey: process.env.ANTHROPIC_API_KEY,
});
