/** 将用户/网关别名规范为内部模型 ID */
const MODEL_ID_ALIASES: Record<string, string> = {
  "gpt-images2": "gpt-image-2",
  "gpt-image2": "gpt-image-2",
  "gpt_images2": "gpt-image-2",
};

export function normalizeModelId(modelId: string): string {
  const trimmed = modelId.trim();
  return MODEL_ID_ALIASES[trimmed] ?? trimmed;
}
