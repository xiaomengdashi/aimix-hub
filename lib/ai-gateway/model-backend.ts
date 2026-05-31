import type { ChatAiProvider } from "@/lib/chat/provider";
import type { ModelBackend, ModelUiScope } from "@/lib/chat/models";
import { defaultBackendForProvider } from "@/lib/ai-gateway/gateway-discovery";

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

export function inferBackendFromEndpointTypes(
  types: string[] | undefined,
  uiProvider?: ModelUiScope,
): ModelBackend {
  if (!types?.length) {
    return uiProvider ? defaultBackendForProvider(uiProvider) : "anthropic";
  }

  const joined = types.join(" ").toLowerCase();
  if (/\banthropic\b/.test(joined)) return "anthropic";
  if (/\bgoogle\b/.test(joined)) return "google";
  if (/openai/.test(joined)) return "openai";

  return uiProvider ? defaultBackendForProvider(uiProvider) : "anthropic";
}
