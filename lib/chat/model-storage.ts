import type { ModelUiScope } from "@/lib/chat/models";
import {
  getDefaultModelIdForScope,
  isAllowedChatModelId,
} from "@/lib/chat/models";
import { IMAGE_GENERATION_MODEL_ID } from "@/lib/image-generation/constants";

const MODEL_KEY_PREFIX = "claude-clone:model:";

export function getStoredModelForScope(
  uiScope: ModelUiScope,
): string | undefined {
  if (uiScope === "image") return IMAGE_GENERATION_MODEL_ID;
  if (typeof window === "undefined") return undefined;
  const stored = localStorage.getItem(`${MODEL_KEY_PREFIX}${uiScope}`);
  if (stored && isAllowedChatModelId(stored)) return stored;
  return undefined;
}

export function setStoredModelForScope(
  uiScope: ModelUiScope,
  modelId: string,
): void {
  if (uiScope === "image") return;
  if (typeof window === "undefined") return;
  localStorage.setItem(`${MODEL_KEY_PREFIX}${uiScope}`, modelId);
}

export function resolveInitialModelId(uiScope: ModelUiScope): string {
  return (
    getStoredModelForScope(uiScope) ?? getDefaultModelIdForScope(uiScope)
  );
}

/** @deprecated 使用 getStoredModelForScope */
export function getStoredModelForProvider(
  uiProvider: Exclude<ModelUiScope, "image">,
): string | undefined {
  return getStoredModelForScope(uiProvider);
}

/** @deprecated 使用 setStoredModelForScope */
export function setStoredModelForProvider(
  uiProvider: Exclude<ModelUiScope, "image">,
  modelId: string,
): void {
  setStoredModelForScope(uiProvider, modelId);
}
