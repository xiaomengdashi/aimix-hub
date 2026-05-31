import type { LanguageModel } from "ai";
import {
  createAnthropicProvider,
  createOpenAiGatewayProvider,
} from "@/lib/ai-gateway/create-providers";
import { getChatModel, type ChatModel } from "@/lib/chat/models";
import { inferModelBackend } from "@/lib/ai-gateway/model-backend";

/** Claude → Anthropic Messages；GPT / Gemini → OpenAI Chat Completions（共用网关密钥与 Base URL） */
export async function resolveLanguageModel(
  modelId: string,
  modelDef?: ChatModel,
): Promise<LanguageModel> {
  const def = modelDef ?? getChatModel(modelId);
  const apiModel = def?.apiModel ?? modelId;
  const backend = def?.backend ?? inferModelBackend(modelId);

  if (backend === "openai" || backend === "google") {
    const openaiGateway = await createOpenAiGatewayProvider();
    return openaiGateway.chat(apiModel);
  }

  const anthropic = await createAnthropicProvider();
  return anthropic(apiModel);
}
