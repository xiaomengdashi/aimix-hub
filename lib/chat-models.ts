export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const CHAT_MODELS: ChatModel[] = [
  {
    id: "claude-sonnet-4-6",
    name: "Sonnet 4.6",
    description: "均衡：聪明、快速，适合日常使用",
  },
  {
    id: "claude-opus-4-7",
    name: "Opus 4.7",
    description: "最强能力，适合复杂任务",
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Haiku 4.5",
    description: "最快、最省，适合简单对话",
  },
];

export const DEFAULT_CHAT_MODEL_ID = CHAT_MODELS[0]!.id;

const ALLOWED_CHAT_MODEL_IDS = new Set(
  CHAT_MODELS.map((model) => model.id),
);

export function isAllowedChatModelId(id: string): boolean {
  return ALLOWED_CHAT_MODEL_IDS.has(id);
}

/** Returns model id when allowed; otherwise null. */
export function parseChatModelId(model: unknown): string | null {
  if (typeof model !== "string" || !model.trim()) {
    return null;
  }
  return isAllowedChatModelId(model) ? model : null;
}

export function getChatModel(id: string): ChatModel | undefined {
  return CHAT_MODELS.find((m) => m.id === id);
}
