import type { UIMessage } from "ai";
import { decodeDataUrlText, isTextMediaType } from "@/lib/attachments/data-url";

/** 供 API 使用：把文本类 file part 展开为 model 可见的 text，不改变前端存储结构 */
export function expandTextFilePartsForModel(
  messages: UIMessage[],
): UIMessage[] {
  return messages.map((message) => {
    if (message.role !== "user" || !message.parts?.length) {
      return message;
    }

    const parts = message.parts.flatMap((part) => {
      if (part.type !== "file" || !isTextMediaType(part.mediaType)) {
        return [part];
      }

      const text = decodeDataUrlText(part.url);
      if (!text) return [part];

      const label = part.filename
        ? `【附件：${part.filename}】\n\n`
        : "【附件】\n\n";

      return [
        {
          type: "text" as const,
          text: `${label}${text}`,
        },
      ];
    });

    return { ...message, parts };
  });
}
