import type { ChatAiProvider } from "@/lib/chat/provider";
import type { ModelBackend } from "@/lib/chat/models";

/** GPT / o-series / Gemini 等走 OpenAI Chat Completions 兼容接口 */
export function isOpenAiCompatibleModelId(modelId: string): boolean {
  return /^(gpt-|o[1-9]|chatgpt|gemini)/i.test(modelId);
}

export function backendForUiProvider(uiProvider: ChatAiProvider): ModelBackend {
  if (uiProvider === "chatgpt" || uiProvider === "gemini") return "openai";
  return "anthropic";
}

export function inferModelBackend(modelId: string): ModelBackend {
  if (isOpenAiCompatibleModelId(modelId)) return "openai";
  return "anthropic";
}
