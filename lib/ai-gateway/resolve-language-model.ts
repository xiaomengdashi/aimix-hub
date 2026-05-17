import type { LanguageModel } from "ai";
import { anthropic } from "@/lib/ai-gateway/anthropic";
import { getChatModel, type ModelBackend } from "@/lib/chat/models";
import { openaiGateway } from "@/lib/ai-gateway/openai-gateway";

function inferBackend(modelId: string): ModelBackend {
  if (/^gemini/i.test(modelId)) return "openai";
  return "anthropic";
}

/** 统一走 ANTHROPIC_API_KEY + ANTHROPIC_BASE_URL；Gemini 等需 OpenAI chat/completions 格式 */
export function resolveLanguageModel(modelId: string): LanguageModel {
  const def = getChatModel(modelId);
  const apiModel = def?.apiModel ?? modelId;
  const backend = def?.backend ?? inferBackend(modelId);

  if (backend === "openai" || backend === "google") {
    return openaiGateway.chat(apiModel);
  }

  return anthropic(apiModel);
}
