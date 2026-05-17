import { NextResponse } from "next/server";
import type { ChatAiProvider } from "@/lib/chat/provider";
import type { ChatModel } from "@/lib/chat/models";
import { FALLBACK_CHAT_MODELS } from "@/lib/chat/models";
import { buildChatModelsFromGateway, getModelsUrl } from "@/lib/ai-gateway/gateway-models";
import { applyModelDisplayList } from "@/lib/ai-gateway/model-display";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await buildChatModelsFromGateway();
    const byProvider = groupByProvider(models);

    return NextResponse.json({
      source: "gateway",
      modelsUrl: getModelsUrl(),
      models,
      byProvider,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "拉取模型列表失败";
    const fallback = applyModelDisplayList(FALLBACK_CHAT_MODELS);
    const byProvider = groupByProvider(fallback);

    return NextResponse.json(
      {
        source: "fallback",
        error: message,
        models: fallback,
        byProvider,
      },
      { status: 200 },
    );
  }
}

function groupByProvider(
  models: ChatModel[],
): Record<ChatAiProvider, ChatModel[]> {
  const providers: ChatAiProvider[] = ["chatgpt", "claude", "gemini", "other"];
  return Object.fromEntries(
    providers.map((p) => [p, models.filter((m) => m.uiProvider === p)]),
  ) as Record<ChatAiProvider, ChatModel[]>;
}
