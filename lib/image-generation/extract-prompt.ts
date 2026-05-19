import type { UIMessage } from "ai";
import { extractLastUserMessageText } from "@/lib/chat/extract-user-text";

export function extractImagePromptFromMessages(messages: UIMessage[]): string {
  const text = extractLastUserMessageText(messages);
  if (text) return text;
  throw new Error("请输入要生成的图像描述");
}
