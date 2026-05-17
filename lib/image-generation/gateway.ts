export type GatewayGeneratedImage = {
  bytes: Uint8Array;
  mediaType: string;
};

type ImagesGenerationsResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  error?: { message?: string };
  /** 误走 chat 接口时会返回 */
  choices?: unknown[];
  object?: string;
};

function normalizeBaseUrl(url: string | undefined): string {
  const base = (url ?? "https://yunwu.ai/v1").replace(/\/$/, "");
  return base.endsWith("/v1") ? base : `${base}/v1`;
}

function mediaTypeFromFormat(format: "jpeg" | "png" | "webp"): string {
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  return "image/jpeg";
}

async function fetchImageBytesFromUrl(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`下载图片失败 (${res.status})`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

function parseGenerationsResponse(
  json: ImagesGenerationsResponse,
  mediaType: string,
): GatewayGeneratedImage {
  if (json.choices?.length) {
    throw new Error(
      "网关返回了对话格式而非图片，请确认模型 gpt-image-2 走 /v1/images/generations",
    );
  }

  const item = json.data?.[0];
  if (!item) {
    const msg = json.error?.message ?? "响应中无图片数据";
    throw new Error(msg);
  }

  if (item.b64_json) {
    return {
      bytes: new Uint8Array(Buffer.from(item.b64_json, "base64")),
      mediaType,
    };
  }

  throw new Error("无法解析图片响应");
}

/**
 * 按云雾网关文档调用 POST /v1/images/generations
 * @see https://yunwu.ai/v1/images/generations
 */
export async function generateGatewayImage(options: {
  model: string;
  prompt: string;
  size?: "1024x1024" | "512x512" | "256x256";
  quality?: "low" | "medium" | "high" | "auto";
  format?: "jpeg" | "png" | "webp";
  abortSignal?: AbortSignal;
}): Promise<GatewayGeneratedImage> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 ANTHROPIC_API_KEY");
  }

  const format = options.format ?? "jpeg";
  const mediaType = mediaTypeFromFormat(format);
  const url = `${normalizeBaseUrl(process.env.ANTHROPIC_BASE_URL)}/images/generations`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      prompt: options.prompt,
      n: 1,
      size: options.size ?? "1024x1024",
      quality: options.quality ?? "low",
      format,
    }),
    signal: options.abortSignal,
  });

  const text = await res.text();
  let json: ImagesGenerationsResponse;
  try {
    json = JSON.parse(text) as ImagesGenerationsResponse;
  } catch {
    throw new Error(`图片接口返回非 JSON (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = json.error?.message ?? text.slice(0, 300);
    throw new Error(`图片生成失败 (${res.status}): ${msg}`);
  }

  const item = json.data?.[0];
  if (item?.b64_json) {
    return parseGenerationsResponse(json, mediaType);
  }
  if (item?.url) {
    const bytes = await fetchImageBytesFromUrl(item.url);
    return { bytes, mediaType };
  }

  return parseGenerationsResponse(json, mediaType);
}
