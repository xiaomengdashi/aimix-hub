import type { ChatAiProvider } from "@/lib/chat-ai-provider";
import {
  getDefaultModelIdForProvider,
  isAllowedChatModelId,
} from "@/lib/chat-models";

const MODEL_KEY_PREFIX = "claude-clone:model:";

export function getStoredModelForProvider(
  uiProvider: ChatAiProvider,
): string | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = localStorage.getItem(`${MODEL_KEY_PREFIX}${uiProvider}`);
  if (stored && isAllowedChatModelId(stored)) return stored;
  return undefined;
}

export function setStoredModelForProvider(
  uiProvider: ChatAiProvider,
  modelId: string,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${MODEL_KEY_PREFIX}${uiProvider}`, modelId);
}

export function resolveInitialModelId(uiProvider: ChatAiProvider): string {
  return (
    getStoredModelForProvider(uiProvider) ??
    getDefaultModelIdForProvider(uiProvider)
  );
}
