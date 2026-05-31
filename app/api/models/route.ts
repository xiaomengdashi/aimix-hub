import { NextResponse } from "next/server";
import type { ChatAiProvider } from "@/lib/chat/provider";
import type { ChatModel } from "@/lib/chat/models";
import { getEnabledModelCatalog } from "@/lib/chat/model-catalog";
import { getModelsUrl } from "@/lib/ai-gateway/gateway-models";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await getEnabledModelCatalog();
    const byProvider = groupByProvider(models);
    let modelsUrl: string | null = null;

    if (isAdminClientConfigured()) {
      try {
        modelsUrl = await getModelsUrl();
      } catch {
        modelsUrl = null;
      }
    }

    return NextResponse.json({
      source: "catalog",
      modelsUrl,
      models,
      byProvider,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "加载模型列表失败";

    return NextResponse.json(
      {
        source: "fallback",
        error: message,
        models: [],
        byProvider: groupByProvider([]),
      },
      { status: 503 },
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
