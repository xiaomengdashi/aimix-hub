/** 网关 gpt-image 等模型支持的预设尺寸（与云雾 / OpenAI Images API 一致） */
export const GPT_IMAGE_SIZES = [
  {
    value: "auto",
    label: "自动",
    subtitle: "由模型选择",
    pixels: "—",
    group: "default",
  },
  {
    value: "1024x1024",
    label: "1024 × 1024",
    subtitle: "正方形",
    pixels: "1.0 MP",
    group: "1k",
  },
  {
    value: "1536x1024",
    label: "1536 × 1024",
    subtitle: "横图 3:2",
    pixels: "1.6 MP",
    group: "1k",
  },
  {
    value: "1024x1536",
    label: "1024 × 1536",
    subtitle: "竖图 2:3",
    pixels: "1.6 MP",
    group: "1k",
  },
  {
    value: "2048x2048",
    label: "2048 × 2048",
    subtitle: "2K 正方形",
    pixels: "4.2 MP",
    group: "2k",
  },
  {
    value: "2048x1152",
    label: "2048 × 1152",
    subtitle: "2K 横图 16:9",
    pixels: "2.4 MP",
    group: "2k",
  },
  {
    value: "3840x2160",
    label: "3840 × 2160",
    subtitle: "4K 横图 16:9",
    pixels: "8.3 MP",
    group: "4k",
  },
  {
    value: "2160x3840",
    label: "2160 × 3840",
    subtitle: "4K 竖图 9:16",
    pixels: "8.3 MP",
    group: "4k",
  },
] as const;

/** DALL·E 2 固定尺寸 */
export const DALLE2_IMAGE_SIZES = [
  { value: "256x256", label: "256 × 256", subtitle: "小图", pixels: "66K", group: "dalle2" },
  { value: "512x512", label: "512 × 512", subtitle: "中图", pixels: "262K", group: "dalle2" },
  {
    value: "1024x1024",
    label: "1024 × 1024",
    subtitle: "大图",
    pixels: "1.0 MP",
    group: "dalle2",
  },
] as const;

/** DALL·E 3 固定尺寸 */
export const DALLE3_IMAGE_SIZES = [
  {
    value: "1024x1024",
    label: "1024 × 1024",
    subtitle: "正方形",
    pixels: "1.0 MP",
    group: "dalle3",
  },
  {
    value: "1792x1024",
    label: "1792 × 1024",
    subtitle: "横图",
    pixels: "1.8 MP",
    group: "dalle3",
  },
  {
    value: "1024x1792",
    label: "1024 × 1792",
    subtitle: "竖图",
    pixels: "1.8 MP",
    group: "dalle3",
  },
] as const;

export const IMAGE_SIZE_GROUPS: Record<string, string> = {
  default: "",
  "1k": "1K",
  "2k": "2K",
  "4k": "4K",
};

/** API 尺寸约束（自定义宽高时需满足） */
export const IMAGE_SIZE_CONSTRAINTS = {
  maxEdgePx: 3840,
  minTotalPixels: 655_360,
  maxTotalPixels: 8_294_400,
  maxAspectRatio: 3,
  alignPx: 16,
} as const;

export const IMAGE_N_MIN = 1;
export const IMAGE_N_MAX = 10;

export type ImageSizeOption = {
  value: string;
  label: string;
  subtitle: string;
  pixels: string;
  group?: string;
};

export type GptImageSize = (typeof GPT_IMAGE_SIZES)[number]["value"];
export type Dalle2ImageSize = (typeof DALLE2_IMAGE_SIZES)[number]["value"];
export type Dalle3ImageSize = (typeof DALLE3_IMAGE_SIZES)[number]["value"];

export type ImageSize = string;

export const IMAGE_QUALITIES = [
  { value: "auto", label: "自动", description: "由模型决定（默认）" },
  { value: "low", label: "标准", description: "更快、更省" },
  { value: "medium", label: "中等", description: "均衡" },
  { value: "high", label: "高质量", description: "细节更好" },
] as const;

export const IMAGE_FORMATS = [
  { value: "jpeg", label: "JPEG", description: "体积更小" },
  { value: "png", label: "PNG", description: "支持透明" },
  { value: "webp", label: "WebP", description: "现代格式" },
] as const;

export type ImageQuality = (typeof IMAGE_QUALITIES)[number]["value"];
export type ImageFormat = (typeof IMAGE_FORMATS)[number]["value"];

export type ImageGenerationParams = {
  model: string;
  prompt: string;
  size: ImageSize;
  quality: ImageQuality;
  format: ImageFormat;
};

export const DEFAULT_IMAGE_PARAMS: Omit<ImageGenerationParams, "prompt"> = {
  model: "gpt-image-2",
  size: "auto",
  quality: "auto",
  format: "jpeg",
};

export const IMAGE_STUDIO_STORAGE_KEY = "claude-clone:image-studio-settings";

/** 宽×高总像素数（十进制 MP） */
export function formatPixelCount(size: string): string {
  if (size === "auto") return "—";
  const match = /^(\d+)x(\d+)$/.exec(size);
  if (!match) return "";
  const total = Number(match[1]) * Number(match[2]);
  if (total >= 1_000_000) {
    return `${(total / 1_000_000).toFixed(1)} MP`;
  }
  return `${Math.round(total / 1000)}K`;
}

/** 解析 WxH，校验是否符合网关尺寸规则 */
export function validateImageDimensions(
  width: number,
  height: number,
): { ok: true } | { ok: false; reason: string } {
  const { maxEdgePx, minTotalPixels, maxTotalPixels, maxAspectRatio, alignPx } =
    IMAGE_SIZE_CONSTRAINTS;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return { ok: false, reason: "宽高须为正整数" };
  }
  if (width > maxEdgePx || height > maxEdgePx) {
    return { ok: false, reason: `单边最大 ${maxEdgePx}px` };
  }
  if (width % alignPx !== 0 || height % alignPx !== 0) {
    return { ok: false, reason: `宽高须为 ${alignPx}px 的倍数` };
  }
  const total = width * height;
  if (total < minTotalPixels || total > maxTotalPixels) {
    return {
      ok: false,
      reason: `总像素须在 ${(minTotalPixels / 1_000_000).toFixed(2)}–${(maxTotalPixels / 1_000_000).toFixed(2)} MP 之间`,
    };
  }
  const long = Math.max(width, height);
  const short = Math.min(width, height);
  if (long / short > maxAspectRatio) {
    return { ok: false, reason: `长宽比不得超过 ${maxAspectRatio}:1` };
  }
  return { ok: true };
}

export function getImageSizesForModel(modelId: string): ImageSizeOption[] {
  const id = modelId.toLowerCase();
  if (id.includes("dall-e-3") || id.includes("dalle-3")) {
    return [...DALLE3_IMAGE_SIZES];
  }
  if (id.includes("dall-e-2") || id.includes("dalle-2")) {
    return [...DALLE2_IMAGE_SIZES];
  }
  return [...GPT_IMAGE_SIZES];
}

export function isValidImageSizeForModel(modelId: string, size: string): boolean {
  return getImageSizesForModel(modelId).some((s) => s.value === size);
}

export function parseImageSize(value: unknown, modelId?: string): ImageSize {
  const allowed = getImageSizesForModel(modelId ?? DEFAULT_IMAGE_PARAMS.model);
  if (typeof value === "string" && allowed.some((s) => s.value === value)) {
    return value;
  }
  const fallback =
    allowed.find((s) => s.value === DEFAULT_IMAGE_PARAMS.size)?.value ??
    allowed[0]?.value ??
    "auto";
  return fallback;
}

export function parseImageQuality(value: unknown): ImageQuality {
  if (IMAGE_QUALITIES.some((q) => q.value === value)) return value as ImageQuality;
  return DEFAULT_IMAGE_PARAMS.quality;
}

export function parseImageFormat(value: unknown): ImageFormat {
  if (IMAGE_FORMATS.some((f) => f.value === value)) return value as ImageFormat;
  return DEFAULT_IMAGE_PARAMS.format;
}

/** @deprecated 使用 getImageSizesForModel */
export const IMAGE_SIZES = GPT_IMAGE_SIZES;
