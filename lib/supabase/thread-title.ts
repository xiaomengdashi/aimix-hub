import type { ThreadMessage } from "@assistant-ui/core";

export const MAX_THREAD_TITLE_LENGTH = 50;

const MAX_TITLE_LENGTH = MAX_THREAD_TITLE_LENGTH;

export type ThreadTitleMessage = {
  role: "user" | "assistant";
  text: string;
};

export function serializeMessagesForTitle(
  messages: readonly ThreadMessage[],
): ThreadTitleMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const text = m.content
        .filter((p) => p.type === "text")
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("\n")
        .trim();
      return { role: m.role as "user" | "assistant", text };
    })
    .filter((m) => m.text.length > 0);
}

/** 本地回退：首条用户消息截断 */
export function titleFromMessages(messages: readonly ThreadMessage[]): string {
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (!firstUserMessage) return "";

  const textPart = firstUserMessage.content.find((p) => p.type === "text");
  if (!textPart || textPart.type !== "text") return "";

  const text = textPart.text.trim();
  if (!text) return "";

  return text.length > MAX_TITLE_LENGTH
    ? `${text.slice(0, MAX_TITLE_LENGTH - 3)}...`
    : text;
}

export async function generateAITitle(
  messages: readonly ThreadMessage[],
): Promise<string> {
  const payload = serializeMessagesForTitle(messages);
  if (payload.length === 0) return titleFromMessages(messages);

  try {
    const res = await fetch("/api/thread-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payload }),
    });
    if (!res.ok) return titleFromMessages(messages);

    const data = (await res.json()) as { title?: string };
    const title = data.title?.trim();
    return title || titleFromMessages(messages);
  } catch {
    return titleFromMessages(messages);
  }
}
