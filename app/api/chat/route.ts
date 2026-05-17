import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { anthropic } from "@/lib/anthropic";
import { requireUser } from "@/lib/auth/require-user";
import {
  DEFAULT_CHAT_MODEL_ID,
  parseChatModelId,
} from "@/lib/chat-models";
import { getChatMode, parseChatModeId } from "@/lib/chat-modes";
import { expandTextFilePartsForModel } from "@/lib/expand-message-file-parts";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { messages, model, mode } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Invalid messages format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (model !== undefined && model !== null && parseChatModelId(model) === null) {
    return new Response(JSON.stringify({ error: "Invalid model" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (mode !== undefined && mode !== null && parseChatModeId(mode) === null) {
    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const modelId = parseChatModelId(model) ?? DEFAULT_CHAT_MODEL_ID;
  const modeId = parseChatModeId(mode);
  const system = modeId ? getChatMode(modeId)?.systemPrompt : undefined;

  const result = streamText({
    model: anthropic(modelId),
    ...(system ? { system } : {}),
    messages: await convertToModelMessages(
      expandTextFilePartsForModel(messages as UIMessage[]),
    ),
  });

  return result.toUIMessageStreamResponse();
}
