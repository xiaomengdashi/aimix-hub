import type { ChatAiProvider } from "@/lib/chat/provider";
import type { ModelUiScope } from "@/lib/chat/models";

export function uiProviderForGatewayId(id: string): ModelUiScope {
  if (/^gpt-image/i.test(id)) return "image";
  if (/dall-e|flux|midjourney|stable-diffusion|sdxl|ideogram/i.test(id)) {
    return "image";
  }
  if (/^claude/i.test(id)) return "claude";
  if (/^(gpt-|o[1-9]|chatgpt)/i.test(id)) return "chatgpt";
  if (/^gemini/i.test(id)) return "gemini";
  return "other";
}

export function defaultBackendForProvider(
  uiProvider: ModelUiScope,
): "openai" | "anthropic" | "google" {
  if (uiProvider === "chatgpt" || uiProvider === "gemini") return "openai";
  return "anthropic";
}

export function isChatAiProvider(value: string): value is ChatAiProvider {
  return (
    value === "chatgpt" ||
    value === "claude" ||
    value === "gemini" ||
    value === "other"
  );
}
