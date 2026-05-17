import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { anthropic } from "@/lib/anthropic";
import { requireUser } from "@/lib/auth/require-user";
import {
  DEFAULT_CHAT_MODEL_ID,
  parseChatModelId,
} from "@/lib/chat-models";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { messages, model } = body;

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

  const modelId = parseChatModelId(model) ?? DEFAULT_CHAT_MODEL_ID;

  const result = streamText({
    model: anthropic(modelId),
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
