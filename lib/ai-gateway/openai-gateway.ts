import { createOpenAI } from "@ai-sdk/openai";

function normalizeOpenAIBaseUrl(url: string | undefined): string {
  const base = (url ?? "https://yunwu.ai/v1").replace(/\/$/, "");
  return base.endsWith("/v1") ? base : `${base}/v1`;
}

/** 与 Claude 文本模型共用网关密钥与 Base URL */
export const openaiGateway = createOpenAI({
  baseURL: normalizeOpenAIBaseUrl(process.env.ANTHROPIC_BASE_URL),
  apiKey: process.env.ANTHROPIC_API_KEY,
});
