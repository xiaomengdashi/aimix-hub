import type { ChatAiProvider } from "@/lib/chat/provider";
import { IMAGE_GENERATION_MODEL_ID } from "@/lib/image-generation/constants";

/** 模型在 UI 中的归属（含独立绘图应用） */
export type ModelUiScope = ChatAiProvider | "image";
import { getGatewayChatModels } from "@/lib/ai-gateway/gateway-models";
import { normalizeModelId } from "@/lib/ai-gateway/normalize-model-id";

export type ModelBackend = "anthropic" | "openai" | "google";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  uiProvider: ModelUiScope;
  backend: ModelBackend;
  apiModel: string;
};

/** 网关不可用时的兜底（与历史配置一致） */
export const FALLBACK_CHAT_MODELS: ChatModel[] = [
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
    description: "旗舰对话，综合能力强",
    contextWindow: 256_000,
    uiProvider: "chatgpt",
    backend: "anthropic",
    apiModel: "gpt-5.5",
  },
  {
    id: "gpt-5.4-pro",
    name: "GPT-5.4 Pro",
    description: "更强推理，适合复杂问题",
    contextWindow: 256_000,
    uiProvider: "chatgpt",
    backend: "anthropic",
    apiModel: "gpt-5.4-pro",
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    description: "更快更省，适合日常对话",
    contextWindow: 256_000,
    uiProvider: "chatgpt",
    backend: "anthropic",
    apiModel: "gpt-5.4-mini",
  },
  {
    id: "gpt-5.3-chat",
    name: "GPT-5.3 Chat",
    description: "对话优化，响应顺滑",
    contextWindow: 200_000,
    uiProvider: "chatgpt",
    backend: "anthropic",
    apiModel: "gpt-5.3-chat",
  },
  {
    id: "gpt-5.2-chat",
    name: "GPT-5.2 Chat",
    description: "稳定对话，性价比高",
    contextWindow: 200_000,
    uiProvider: "chatgpt",
    backend: "anthropic",
    apiModel: "gpt-5.2-chat",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "成熟多模态，综合稳定",
    contextWindow: 128_000,
    uiProvider: "chatgpt",
    backend: "anthropic",
    apiModel: "gpt-4o",
  },
  {
    id: IMAGE_GENERATION_MODEL_ID,
    name: "GPT Image 2",
    description: "文生图，输入描述即可生成图像",
    contextWindow: 0,
    uiProvider: "image",
    backend: "anthropic",
    apiModel: IMAGE_GENERATION_MODEL_ID,
  },
  {
    id: "claude-sonnet-4-6",
    name: "Sonnet 4.6",
    description: "均衡：聪明、快速，适合日常使用",
    contextWindow: 200_000,
    uiProvider: "claude",
    backend: "anthropic",
    apiModel: "claude-sonnet-4-6",
  },
  {
    id: "claude-opus-4-7",
    name: "Opus 4.7",
    description: "最强能力，适合复杂任务",
    contextWindow: 200_000,
    uiProvider: "claude",
    backend: "anthropic",
    apiModel: "claude-opus-4-7",
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Haiku 4.5",
    description: "最快、最省，适合简单对话",
    contextWindow: 200_000,
    uiProvider: "claude",
    backend: "anthropic",
    apiModel: "claude-haiku-4-5-20251001",
  },
  {
    id: "claude-sonnet-4-5",
    name: "Sonnet 4.5",
    description: "均衡实用，适合日常对话",
    contextWindow: 200_000,
    uiProvider: "claude",
    backend: "anthropic",
    apiModel: "claude-sonnet-4-5",
  },
  {
    id: "claude-opus-4-6",
    name: "Opus 4.6",
    description: "强推理能力，适合复杂任务",
    contextWindow: 200_000,
    uiProvider: "claude",
    backend: "anthropic",
    apiModel: "claude-opus-4-6",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    description: "预览旗舰，复杂推理",
    contextWindow: 1_000_000,
    uiProvider: "gemini",
    backend: "openai",
    apiModel: "gemini-3.1-pro-preview",
  },
  {
    id: "gemini-3.1-flash-preview",
    name: "Gemini 3.1 Flash Preview",
    description: "快速预览，日常首选",
    contextWindow: 1_000_000,
    uiProvider: "gemini",
    backend: "openai",
    apiModel: "gemini-3.1-flash-preview",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "复杂推理与长文档",
    contextWindow: 1_000_000,
    uiProvider: "gemini",
    backend: "openai",
    apiModel: "gemini-2.5-pro",
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    description: "轻量预览，低延迟",
    contextWindow: 1_000_000,
    uiProvider: "gemini",
    backend: "openai",
    apiModel: "gemini-3-flash-preview",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "默认推荐，快速且聪明",
    contextWindow: 1_000_000,
    uiProvider: "gemini",
    backend: "openai",
    apiModel: "gemini-2.5-flash",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    description: "轻量快速",
    contextWindow: 1_000_000,
    uiProvider: "gemini",
    backend: "openai",
    apiModel: "gemini-2.5-flash-lite",
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    description: "旗舰推理，复杂任务",
    contextWindow: 128_000,
    uiProvider: "other",
    backend: "anthropic",
    apiModel: "deepseek-v4-pro",
  },
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    description: "快速响应，日常对话",
    contextWindow: 128_000,
    uiProvider: "other",
    backend: "anthropic",
    apiModel: "deepseek-v4-flash",
  },
  {
    id: "glm-5.1",
    name: "GLM-5.1",
    description: "智谱旗舰，中文出色",
    contextWindow: 128_000,
    uiProvider: "other",
    backend: "anthropic",
    apiModel: "glm-5.1",
  },
  {
    id: "MiniMax-M2.7",
    name: "MiniMax M2.7",
    description: "海螺新一代，综合均衡",
    contextWindow: 128_000,
    uiProvider: "other",
    backend: "anthropic",
    apiModel: "MiniMax-M2.7",
  },
  {
    id: "kimi-k2.5",
    name: "Kimi K2.5",
    description: "月之暗面，长文与推理",
    contextWindow: 128_000,
    uiProvider: "other",
    backend: "anthropic",
    apiModel: "kimi-k2.5",
  },
  {
    id: "qwen3.6-plus",
    name: "Qwen3.6",
    description: "通义旗舰，综合能力",
    contextWindow: 128_000,
    uiProvider: "other",
    backend: "anthropic",
    apiModel: "qwen3.6-plus",
  },
  {
    id: "mimo-v2.5-pro",
    name: "MiMo V2.5 Pro",
    description: "小米旗舰，推理增强",
    contextWindow: 128_000,
    uiProvider: "other",
    backend: "anthropic",
    apiModel: "mimo-v2.5-pro",
  },
];

let clientModels: ChatModel[] | null = null;

export function setClientChatModels(models: ChatModel[]): void {
  clientModels = models;
}

export function getClientChatModels(): ChatModel[] {
  return clientModels ?? FALLBACK_CHAT_MODELS;
}

function modelMap(models: ChatModel[]): Map<string, ChatModel> {
  return new Map(models.map((m) => [m.id, m]));
}

export function getModelsForScope(uiScope: ModelUiScope): ChatModel[] {
  return getClientChatModels().filter((m) => m.uiProvider === uiScope);
}

/** @deprecated 使用 getModelsForScope */
export function getModelsForProvider(uiProvider: ChatAiProvider): ChatModel[] {
  return getModelsForScope(uiProvider);
}

export function getDefaultModelIdForScope(uiScope: ModelUiScope): string {
  if (uiScope === "image") return IMAGE_GENERATION_MODEL_ID;
  const list = getModelsForScope(uiScope);
  const fallback = FALLBACK_CHAT_MODELS.find((m) => m.uiProvider === uiScope);
  return list[0]?.id ?? fallback?.id ?? FALLBACK_CHAT_MODELS[0]!.id;
}

/** @deprecated 使用 getDefaultModelIdForScope */
export function getDefaultModelIdForProvider(
  uiProvider: ChatAiProvider,
): string {
  return getDefaultModelIdForScope(uiProvider);
}

export async function getDefaultModelIdForScopeAsync(
  uiScope: ModelUiScope,
): Promise<string> {
  const models = await resolveAllowedModels();
  const match = models.find((m) => m.uiProvider === uiScope);
  return match?.id ?? getDefaultModelIdForScope(uiScope);
}

/** @deprecated 使用 getDefaultModelIdForScopeAsync */
export async function getDefaultModelIdForProviderAsync(
  uiProvider: ChatAiProvider,
): Promise<string> {
  return getDefaultModelIdForScopeAsync(uiProvider);
}

export const DEFAULT_CHAT_MODEL_ID = getDefaultModelIdForProvider("chatgpt");

export async function resolveAllowedModels(): Promise<ChatModel[]> {
  try {
    return await getGatewayChatModels();
  } catch {
    return FALLBACK_CHAT_MODELS;
  }
}

export async function isAllowedChatModelIdAsync(id: string): Promise<boolean> {
  const models = await resolveAllowedModels();
  return modelMap(models).has(id);
}

export function isAllowedChatModelId(id: string): boolean {
  if (modelMap(getClientChatModels()).has(id)) return true;
  return modelMap(FALLBACK_CHAT_MODELS).has(id);
}

export async function parseChatModelIdAsync(
  model: unknown,
): Promise<string | null> {
  if (typeof model !== "string" || !model.trim()) return null;
  const id = normalizeModelId(model);
  const allowed = await resolveAllowedModels();
  return modelMap(allowed).has(id) ? id : null;
}

export function parseChatModelId(model: unknown): string | null {
  if (typeof model !== "string" || !model.trim()) return null;
  const id = normalizeModelId(model);
  return isAllowedChatModelId(id) ? id : null;
}

export function getChatModel(id: string): ChatModel | undefined {
  return modelMap(getClientChatModels()).get(id) ?? modelMap(FALLBACK_CHAT_MODELS).get(id);
}

export function getChatModelContextWindow(id: string): number {
  return getChatModel(id)?.contextWindow ?? 200_000;
}

/** @deprecated 使用 getClientChatModels */
export const CHAT_MODELS = FALLBACK_CHAT_MODELS;
