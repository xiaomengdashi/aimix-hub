export type ThreadQuestionOutlineItem = {
  id: string;
  messageId: string;
  /** 从 1 开始的提问序号 */
  index: number;
  label: string;
};

export const OUTLINE_PANEL_WIDTH = 220;

const OUTLINE_LABEL_MAX = 96;

export function buildThreadQuestionAnchorId(messageId: string): string {
  return `thread-question-${messageId}`;
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .trim();
}

function extractTextFromParts(
  parts: ReadonlyArray<{ type: string; text?: string }>,
): string {
  let text = "";
  for (const part of parts) {
    if (part.type === "text" && typeof part.text === "string") {
      text += `${part.text}\n`;
    }
  }
  return text.trim();
}

function hasNonTextUserContent(
  parts: ReadonlyArray<{ type: string }>,
): boolean {
  return parts.some(
    (part) =>
      part.type === "file" ||
      part.type === "image" ||
      part.type === "attachment",
  );
}

function truncateLabel(text: string): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= OUTLINE_LABEL_MAX) return singleLine;
  return `${singleLine.slice(0, OUTLINE_LABEL_MAX)}…`;
}

export function formatQuestionOutlineLabel(
  rawText: string,
  index: number,
  hasAttachment: boolean,
): string {
  const plain = stripInlineMarkdown(rawText);
  const firstLine = plain.split(/\n/)[0]?.trim() ?? "";
  if (firstLine) return truncateLabel(firstLine);
  if (hasAttachment) return `提问 ${index}（附件）`;
  return `提问 ${index}`;
}

type MessageForQuestionOutline = {
  id: string;
  role: string;
  parts: ReadonlyArray<{ type: string; text?: string }>;
};

/** 按时间顺序收集每条用户消息，作为目录中的一次提问 */
export function collectThreadQuestionOutline(
  messages: ReadonlyArray<MessageForQuestionOutline>,
): ThreadQuestionOutlineItem[] {
  const items: ThreadQuestionOutlineItem[] = [];
  let index = 0;

  for (const message of messages) {
    if (message.role !== "user") continue;
    index += 1;
    const text = extractTextFromParts(message.parts);
    const hasAttachment = hasNonTextUserContent(message.parts);
    items.push({
      id: buildThreadQuestionAnchorId(message.id),
      messageId: message.id,
      index,
      label: formatQuestionOutlineLabel(text, index, hasAttachment),
    });
  }

  return items;
}
