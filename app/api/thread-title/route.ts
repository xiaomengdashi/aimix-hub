import { generateText } from "ai";
import { anthropic } from "@/lib/ai-gateway/anthropic";
import { requireUser } from "@/lib/auth/require-user";
import type { ThreadTitleMessage } from "@/lib/supabase/thread-title";

const TITLE_MODEL_ID = "claude-haiku-4-5-20251001";

function formatConversation(messages: ThreadTitleMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n\n");
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { messages?: ThreadTitleMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages?.filter((m) => m.text.trim()) ?? [];
  if (messages.length === 0) {
    return Response.json({ error: "No messages" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: anthropic(TITLE_MODEL_ID),
      system: `You generate short chat thread titles for a sidebar.
Rules:
- Output ONLY the title text, nothing else.
- Maximum 50 characters.
- No quotes, markdown, or trailing punctuation.
- Use the same language as the user's messages (e.g. Chinese if they wrote in Chinese).
- Summarize the topic of the conversation, not a full sentence.`,
      prompt: formatConversation(messages.slice(0, 6)),
    });

    const title = text.trim().replace(/^["'「『]|["'」』]$/g, "");
    if (!title) {
      return Response.json({ error: "Empty title" }, { status: 500 });
    }

    return Response.json({
      title: title.length > 50 ? `${title.slice(0, 47)}...` : title,
    });
  } catch (error) {
    console.error("[thread-title]", error);
    return Response.json({ error: "Title generation failed" }, { status: 500 });
  }
}
