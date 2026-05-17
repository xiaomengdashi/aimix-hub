export type ChatUsageMetadata = {
  inputTokens?: number;
  outputTokens?: number;
  contextTokens?: number;
};

export type ContextTokenSource = "api" | "estimate";

export function formatTokenCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const k = value / 1000;
    return k >= 100 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  const m = value / 1_000_000;
  return m >= 100 ? `${Math.round(m)}M` : `${m.toFixed(1).replace(/\.0$/, "")}M`;
}

type ThreadMessageForUsage = {
  role: string;
  metadata?: unknown;
  parts: ReadonlyArray<{ type: string; text?: string }>;
};

function extractTextFromParts(parts: ThreadMessageForUsage["parts"]): string {
  let text = "";
  for (const part of parts) {
    if (part.type === "text" && typeof part.text === "string") {
      text += part.text;
    } else if (part.type === "reasoning" && typeof part.text === "string") {
      text += part.text;
    }
  }
  return text;
}

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 2.5);
}

function readUsageMetadata(metadata: unknown): ChatUsageMetadata | null {
  if (!metadata || typeof metadata !== "object") return null;
  const meta = metadata as ChatUsageMetadata;
  if (typeof meta.contextTokens === "number" && meta.contextTokens >= 0) {
    return meta;
  }
  if (
    typeof meta.inputTokens === "number" &&
    typeof meta.outputTokens === "number"
  ) {
    return {
      ...meta,
      contextTokens: meta.inputTokens + meta.outputTokens,
    };
  }
  return null;
}

export function resolveThreadContextTokens(
  messages: ReadonlyArray<ThreadMessageForUsage>,
): {
  tokens: number;
  source: ContextTokenSource;
} {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== "assistant") continue;
    const usage = readUsageMetadata(message.metadata);
    if (usage?.contextTokens != null) {
      return { tokens: usage.contextTokens, source: "api" };
    }
  }

  let total = 0;
  for (const message of messages) {
    total += estimateTokenCount(extractTextFromParts(message.parts));
  }
  return { tokens: total, source: "estimate" };
}
