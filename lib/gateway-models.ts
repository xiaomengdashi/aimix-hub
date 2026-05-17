import type { ChatAiProvider } from "@/lib/chat-ai-provider";
import type { ChatModel } from "@/lib/chat-models";
import { applyModelDisplayList } from "@/lib/model-display";

const CACHE_TTL_MS = 10 * 60 * 1000;

type GatewayModelRow = {
  id: string;
  description?: string;
  model_type?: string;
  tags?: string;
};

/** 非对话场景模型（语音/图像/嵌入等） */
const EXCLUDE_ID =
  /tts|audio|image|realtime|transcribe|vision|embedding|gizmo|whisper|dall-e|flux|midjourney|suno|video|ocr|moderation|search-api|\*/i;

/** ChatGPT 选择器中显式展示的图像生成模型 */
const ALLOW_IMAGE_MODEL_IDS = new Set(["gpt-image-2"]);

const PREFERRED: Record<ChatAiProvider, readonly string[]> = {
  chatgpt: [
    "gpt-5.5",
    "gpt-5.4-pro",
    "gpt-5.4-mini",
    "gpt-5.3-chat",
    "gpt-5.2-chat",
    "gpt-image-2",
    "gpt-4o",
    "o4-mini",
    "gpt-5-mini",
    "gpt-5-nano",
  ],
  claude: [
    "claude-sonnet-4-6",
    "claude-opus-4-7",
    "claude-haiku-4-5-20251001",
    "claude-sonnet-4-5",
    "claude-opus-4-6",
    "claude-haiku-4-5",
  ],
  gemini: [
    "gemini-3.1-pro-preview",
    "gemini-3.1-flash-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
  ],
  other: [
    "deepseek-v4-pro",
    "deepseek-v4-flash",
    "glm-5.1",
    "MiniMax-M2.7",
    "kimi-k2.5",
    "qwen3.6-plus",
    "mimo-v2.5-pro",
  ],
};

const MODELS_LIMIT: Record<ChatAiProvider, number> = {
  chatgpt: 6,
  claude: 5,
  gemini: 5,
  other: 7,
};

let cache: { models: ChatModel[]; at: number } | null = null;

function normalizeModelsUrl(baseUrl: string | undefined): string {
  const base = (baseUrl ?? "https://yunwu.ai/v1").replace(/\/$/, "");
  return base.endsWith("/v1") ? `${base}/models` : `${base}/v1/models`;
}

function uiProviderForId(id: string): ChatAiProvider {
  if (/^claude/i.test(id)) return "claude";
  if (/^(gpt-|o[1-9]|chatgpt)/i.test(id)) return "chatgpt";
  if (/^gemini/i.test(id)) return "gemini";
  return "other";
}

function isChatCandidate(row: GatewayModelRow): boolean {
  const id = row.id;
  if (!id) return false;
  if (ALLOW_IMAGE_MODEL_IDS.has(id)) return true;
  if (EXCLUDE_ID.test(id)) return false;
  if (row.model_type) {
    const t = row.model_type.toLowerCase();
    if (t !== "文本" && t !== "text") return false;
  }
  return true;
}

function versionScore(id: string): number {
  const parts = id.match(/\d+(?:\.\d+)?/g);
  if (!parts?.length) return 0;
  return Math.max(...parts.map((p) => parseFloat(p)));
}

function backendForProvider(uiProvider: ChatAiProvider): ChatModel["backend"] {
  if (uiProvider === "gemini") return "openai";
  return "anthropic";
}

function toChatModel(row: GatewayModelRow, uiProvider: ChatAiProvider): ChatModel {
  return {
    id: row.id,
    name: row.id,
    description: "",
    contextWindow: 200_000,
    uiProvider,
    backend: backendForProvider(uiProvider),
    apiModel: row.id,
  };
}

function pickForProvider(
  rows: GatewayModelRow[],
  uiProvider: ChatAiProvider,
): ChatModel[] {
  const candidates = rows.filter(
    (r) => isChatCandidate(r) && uiProviderForId(r.id) === uiProvider,
  );
  const byId = new Map(candidates.map((r) => [r.id, r]));
  const limit = MODELS_LIMIT[uiProvider];
  const picked: ChatModel[] = [];
  const used = new Set<string>();

  for (const id of PREFERRED[uiProvider]) {
    const row = byId.get(id);
    if (!row || used.has(id)) continue;
    picked.push(toChatModel(row, uiProvider));
    used.add(id);
    if (picked.length >= limit) return picked;
  }

  const rest = candidates
    .filter((r) => !used.has(r.id))
    .sort((a, b) => versionScore(b.id) - versionScore(a.id));

  for (const row of rest) {
    if (picked.length >= limit) break;
    picked.push(toChatModel(row, uiProvider));
  }

  return picked;
}

export async function fetchGatewayModelRows(): Promise<GatewayModelRow[]> {
  const url = normalizeModelsUrl(process.env.ANTHROPIC_BASE_URL);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 ANTHROPIC_API_KEY");
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`拉取模型列表失败 (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as { data?: GatewayModelRow[] };
  return json.data ?? [];
}

export async function buildChatModelsFromGateway(): Promise<ChatModel[]> {
  const rows = await fetchGatewayModelRows();
  const providers: ChatAiProvider[] = ["chatgpt", "claude", "gemini", "other"];
  const picked = providers.flatMap((p) => pickForProvider(rows, p));
  return applyModelDisplayList(picked);
}

export async function getGatewayChatModels(): Promise<ChatModel[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.models;
  }
  const models = await buildChatModelsFromGateway();
  cache = { models, at: Date.now() };
  return models;
}

export function getModelsUrl(): string {
  return normalizeModelsUrl(process.env.ANTHROPIC_BASE_URL);
}
