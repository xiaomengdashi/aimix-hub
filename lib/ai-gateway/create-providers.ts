import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { getGatewayCredentials } from "@/lib/admin/server-integration-settings";

function normalizeAnthropicBaseUrl(url: string): string {
  const base = url.replace(/\/$/, "");
  return base.endsWith("/v1") ? base : `${base}/v1`;
}

function normalizeOpenAIBaseUrl(url: string): string {
  const base = url.replace(/\/$/, "");
  return base.endsWith("/v1") ? base : `${base}/v1`;
}

export async function createAnthropicProvider() {
  const { baseUrl, apiKey } = await getGatewayCredentials();
  return createAnthropic({
    baseURL: normalizeAnthropicBaseUrl(baseUrl),
    apiKey,
  });
}

export async function createOpenAiGatewayProvider() {
  const { baseUrl, apiKey } = await getGatewayCredentials();
  return createOpenAI({
    baseURL: normalizeOpenAIBaseUrl(baseUrl),
    apiKey,
  });
}
