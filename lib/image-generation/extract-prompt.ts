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

export function extractImagePromptFromMessages(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    const text = textFromUserMessage(message);
    if (text) return text;
  }

  throw new Error("请输入要生成的图像描述");
}
