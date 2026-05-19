import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import type { ChatUsageMetadata } from "@/lib/chat/context-usage";
import { requireUser } from "@/lib/auth/require-user";
import {
  getDefaultModelIdForScopeAsync,
  parseChatModelIdAsync,
} from "@/lib/chat/models";
import { isAppId, type AppId } from "@/lib/chat/app-id";
import {
  DEFAULT_CHAT_AI_PROVIDER,
  type ChatAiProvider,
} from "@/lib/chat/provider";
import { resolveLanguageModel } from "@/lib/ai-gateway/resolve-language-model";
import { getChatMode, parseChatModeId } from "@/lib/chat/modes";
import {
  getComposerTool,
  mergeSystemPrompts,
  parseComposerToolId,
} from "@/lib/chat/composer-tools";
import { expandTextFilePartsForModel } from "@/lib/attachments/expand-message-file-parts";
import {
  createImageErrorStreamResponse,
  handleImageGenerationChat,
} from "@/lib/image-generation/handle-chat";
import { isImageGenerationModel } from "@/lib/image-generation/models";
import { normalizeModelId } from "@/lib/ai-gateway/normalize-model-id";
import { isTavilyConfigured } from "@/lib/tavily/env";
import {
  prefetchTavilySearchContext,
  getPrefetchSearchSystemPrompt,
} from "@/lib/tavily/prefetch-search";

/** 文生图可能需 1–2 分钟 */
export const maxDuration = 300;

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { messages, model, mode, tool } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Invalid messages format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const normalizedModel =
    typeof model === "string" ? normalizeModelId(model) : model;

  if (normalizedModel !== undefined && normalizedModel !== null) {
    const parsed = await parseChatModelIdAsync(normalizedModel);
    if (parsed === null && !isImageGenerationModel(String(normalizedModel))) {
      return new Response(JSON.stringify({ error: "Invalid model" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (mode !== undefined && mode !== null && parseChatModeId(mode) === null) {
    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (tool !== undefined && tool !== null && parseComposerToolId(tool) === null) {
    return new Response(JSON.stringify({ error: "Invalid tool" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const uiScope: AppId =
    typeof body.uiProvider === "string" && isAppId(body.uiProvider)
      ? body.uiProvider
      : DEFAULT_CHAT_AI_PROVIDER;
  const uiProvider: ChatAiProvider =
    uiScope === "image" ? "chatgpt" : uiScope;
  const modelId =
    (await parseChatModelIdAsync(normalizedModel)) ??
    (isImageGenerationModel(String(normalizedModel))
      ? normalizeModelId(String(normalizedModel))
      : null) ??
    (await getDefaultModelIdForScopeAsync(uiScope));
  const modeId = parseChatModeId(mode);
  const toolId = parseComposerToolId(tool);
  const isSearchMode = toolId === "search";

  if (isSearchMode && !isTavilyConfigured()) {
    return new Response(
      JSON.stringify({
        error:
          "搜索模式需要 Tavily：请在 .env.local 中配置 TAVILY_API_KEY（可选 TAVILY_BASE_URL）",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (isImageGenerationModel(modelId)) {
    try {
      return await handleImageGenerationChat(
        req,
        messages as UIMessage[],
        modelId,
        user.id,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "图像生成失败";
      return createImageErrorStreamResponse(messages as UIMessage[], message);
    }
  }

  let languageModel;
  try {
    languageModel = resolveLanguageModel(modelId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "模型配置错误";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const uiMessages = messages as UIMessage[];
  let searchPrefetchPrompt: string | undefined;

  if (isSearchMode) {
    try {
      const searchContext = await prefetchTavilySearchContext(uiMessages);
      searchPrefetchPrompt = getPrefetchSearchSystemPrompt(searchContext);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "网页搜索失败";
      return new Response(JSON.stringify({ error: message }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const system = mergeSystemPrompts(
    modeId ? getChatMode(modeId)?.systemPrompt : undefined,
    toolId ? getComposerTool(toolId).systemPrompt : undefined,
    searchPrefetchPrompt,
  );

  const result = streamText({
    model: languageModel,
    ...(system ? { system } : {}),
    messages: await convertToModelMessages(
      expandTextFilePartsForModel(uiMessages),
    ),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages as UIMessage[],
    messageMetadata: ({ part }) => {
      if (part.type !== "finish") return undefined;

      const inputTokens = part.totalUsage.inputTokens ?? 0;
      const outputTokens = part.totalUsage.outputTokens ?? 0;
      const metadata: ChatUsageMetadata = {
        inputTokens,
        outputTokens,
        contextTokens: inputTokens + outputTokens,
      };
      return metadata;
    },
  });
}
