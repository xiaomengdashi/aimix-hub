import { normalizeModelId } from "@/lib/normalize-model-id";

/** 走 /v1/images/generations 的模型 ID（含常见别名） */
const IMAGE_GENERATION_MODEL_IDS = new Set([
  "gpt-image-2",
  "gpt-images2",
  "gpt-image2",
]);

export function isImageGenerationModel(modelId: string): boolean {
  return resolveImageGenerationModelId(modelId) === "gpt-image-2";
}

export function resolveImageGenerationModelId(modelId: string): string {
  return normalizeModelId(modelId);
}
