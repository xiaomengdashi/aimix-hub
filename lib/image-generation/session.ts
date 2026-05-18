import type {
  ImageFormat,
  ImageQuality,
  ImageSize,
} from "@/lib/image-generation/settings";

export const IMAGE_SESSION_FORMAT = "image-studio-v1";

export type ImageSessionStatus = "generating" | "completed" | "failed";

export type ImageSessionContent = {
  version: 1;
  prompt: string;
  model: string;
  modelName?: string;
  size: ImageSize;
  quality: ImageQuality;
  format: ImageFormat;
  status: ImageSessionStatus;
  imageUrl?: string;
  mediaType?: string;
  error?: string;
  createdAt: string;
};

export type ImageSessionSummary = {
  id: string;
  title: string | null;
  prompt: string;
  model: string;
  modelName?: string;
  size: ImageSize;
  quality: ImageQuality;
  format: ImageFormat;
  status: ImageSessionStatus;
  imageUrl?: string;
  mediaType?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export function truncatePromptTitle(prompt: string, max = 48): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed || "未命名绘图";
  return `${trimmed.slice(0, max)}…`;
}

export function parseImageSessionContent(
  raw: unknown,
): ImageSessionContent | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Partial<ImageSessionContent>;
  if (c.version !== 1 || typeof c.prompt !== "string") return null;
  if (typeof c.model !== "string" || typeof c.status !== "string") return null;
  return c as ImageSessionContent;
}
