import type { ChatUsageMetadata } from "@/lib/chat/context-usage";

function readUsageMetadata(metadata: unknown): ChatUsageMetadata | null {
  if (!metadata || typeof metadata !== "object") return null;
  const meta = metadata as ChatUsageMetadata;
  if (
    typeof meta.inputTokens === "number" &&
    typeof meta.outputTokens === "number"
  ) {
    return meta;
  }
  if (typeof meta.contextTokens === "number" && meta.contextTokens >= 0) {
    return meta;
  }
  return null;
}

export function parseChatMessageUsage(content: unknown): ChatUsageMetadata | null {
  if (!content || typeof content !== "object") return null;
  const message = content as { role?: string; metadata?: unknown };
  if (message.role !== "assistant") return null;
  return readUsageMetadata(message.metadata);
}

export function parseImageSessionModel(content: unknown): string | null {
  if (!content || typeof content !== "object") return null;
  const model = (content as { model?: unknown }).model;
  return typeof model === "string" && model.length > 0 ? model : null;
}

export function parseImageSessionModelLabel(content: unknown): string | null {
  if (!content || typeof content !== "object") return null;
  const modelName = (content as { modelName?: unknown }).modelName;
  if (typeof modelName === "string" && modelName.length > 0) return modelName;
  return parseImageSessionModel(content);
}
