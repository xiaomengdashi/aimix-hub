import type { UIMessage } from "ai";

function textFromUserMessage(message: UIMessage): string {
  if (message.parts?.length) {
    return message.parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
  }

  const legacy = (message as { content?: unknown }).content;
  if (typeof legacy === "string") return legacy.trim();
  if (Array.isArray(legacy)) {
    return legacy
      .filter(
        (part): part is { type: "text"; text: string } =>
          typeof part === "object" &&
          part !== null &&
          (part as { type?: string }).type === "text" &&
          typeof (part as { text?: string }).text === "string",
      )
      .map((part) => part.text)
      .join("\n")
      .trim();
  }

  return "";
}

/** 从消息列表中取最后一条用户消息的纯文本 */
export function extractLastUserMessageText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    const text = textFromUserMessage(message);
    if (text) return text;
  }
  return "";
}
