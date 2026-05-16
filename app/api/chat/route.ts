import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

function normalizeAnthropicBaseUrl(url: string | undefined): string {
  const base = (url ?? "https://yunwu.ai/v1").replace(/\/$/, "");
  return base.endsWith("/v1") ? base : `${base}/v1`;
}

const anthropic = createAnthropic({
  baseURL: normalizeAnthropicBaseUrl(process.env.ANTHROPIC_BASE_URL),
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, model } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Invalid messages format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = streamText({
    model: anthropic(model || "claude-sonnet-4-6"),
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
