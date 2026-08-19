import type { ChatAiProvider } from "@/lib/chat/provider";

export type ModelVendor =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "zhipu"
  | "moonshot"
  | "qwen"
  | "minimax"
  | "xiaomi"
  | "xai"
  | "generic";

export function resolveModelVendor(
  modelId: string,
  uiProvider?: ChatAiProvider,
): ModelVendor {
  const id = modelId.toLowerCase();

  if (uiProvider === "chatgpt" || id.startsWith("gpt-") || /^o\d/.test(id)) {
    return "openai";
  }
  if (uiProvider === "claude" || id.includes("claude")) {
    return "anthropic";
  }
  if (uiProvider === "gemini" || id.includes("gemini")) {
    return "google";
  }
  if (uiProvider === "grok" || id.includes("grok")) {
    return "xai";
  }
  if (id.includes("deepseek")) return "deepseek";
  if (id.includes("glm")) return "zhipu";
  if (id.includes("kimi")) return "moonshot";
  if (id.includes("qwen")) return "qwen";
  if (id.includes("minimax")) return "minimax";
  if (id.includes("mimo")) return "xiaomi";

  return "generic";
}
