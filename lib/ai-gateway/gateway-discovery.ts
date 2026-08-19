import {
  isChatAiProvider,
  type ChatAiProvider,
} from "@/lib/chat/provider";
import type { ModelUiScope } from "@/lib/chat/models";

export { isChatAiProvider };

export function uiProviderForGatewayId(id: string): ModelUiScope {
  if (/^gpt-image/i.test(id)) return "image";
  if (/dall-e|flux|midjourney|stable-diffusion|sdxl|ideogram/i.test(id)) {
    return "image";
  }
  if (/^claude/i.test(id)) return "claude";
  if (/^(gpt-|o[1-9]|chatgpt)/i.test(id)) return "chatgpt";
  if (/^gemini/i.test(id)) return "gemini";
  if (/^grok/i.test(id)) return "grok";
  return "other";
}

export function defaultBackendForProvider(
  uiProvider: ModelUiScope,
): "openai" | "anthropic" | "google" {
  if (
    uiProvider === "chatgpt" ||
    uiProvider === "gemini" ||
    uiProvider === "grok"
  ) {
    return "openai";
  }
  return "anthropic";
}

