import { normalizeModelId } from "@/lib/ai-gateway/normalize-model-id";
import { getChatModel } from "@/lib/chat/models";

/** 走 /v1/images/generations 的模型 ID（含常见别名） */
const IMAGE_GENERATION_MODEL_IDS = new Set([
  "gpt-image-2",
  "gpt-images2",
  "gpt-image2",
]);

const IMAGE_MODEL_ID_PATTERN =
  /^(gpt-image|dall-e|flux|midjourney|stable-diffusion|sdxl|ideogram)/i;

export function isImageGenerationModel(modelId: string): boolean {
  const id = normalizeModelId(modelId);
  if (IMAGE_GENERATION_MODEL_IDS.has(id)) return true;
  if (IMAGE_MODEL_ID_PATTERN.test(id)) return true;
  const model = getChatModel(id);
  return model?.uiProvider === "image";
}

export function resolveImageGenerationModelId(modelId: string): string {
  return normalizeModelId(modelId);
}
