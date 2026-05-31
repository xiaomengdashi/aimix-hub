import { inferModelBackend } from "@/lib/ai-gateway/model-backend";
import type { ChatModel } from "@/lib/chat/models";

/** OpenAI Chat Completions 兼容接口常见 completion 上限 */
export const OPENAI_COMPAT_MAX_OUTPUT_TOKENS = 16_384;

/** Anthropic Haiku 系列常见 completion 上限 */
export const ANTHROPIC_HAIKU_MAX_OUTPUT_TOKENS = 8_192;

/** Anthropic Sonnet / Opus 经网关时的保守 completion 上限 */
export const ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS = 16_384;

/** @deprecated 使用 resolveMaxOutputTokens */
export const CHAT_MAX_OUTPUT_TOKENS = OPENAI_COMPAT_MAX_OUTPUT_TOKENS;

export function resolveMaxOutputTokens(
  modelId: string,
  def?: Pick<ChatModel, "backend" | "apiModel">,
): number {
  const backend = def?.backend ?? inferModelBackend(modelId);
  const id = (def?.apiModel ?? modelId).toLowerCase();

  if (backend === "openai" || backend === "google") {
    return OPENAI_COMPAT_MAX_OUTPUT_TOKENS;
  }

  if (/haiku/i.test(id)) {
    return ANTHROPIC_HAIKU_MAX_OUTPUT_TOKENS;
  }

  return ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS;
}
