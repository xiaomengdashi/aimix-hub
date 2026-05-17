import type { AttachmentAdapter } from "@assistant-ui/core";
import { generateId } from "ai";
import { readFileAsDataURL } from "@/lib/attachment-data-url";

const TEXT_EXTENSIONS = new Set([
  ".md",
  ".markdown",
  ".txt",
  ".json",
  ".csv",
  ".html",
  ".xml",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".css",
  ".yml",
  ".yaml",
]);

function isTextLikeFile(file: File): boolean {
  if (file.type.startsWith("text/")) return true;
  if (file.type === "application/json" || file.type === "application/xml") {
    return true;
  }
  const lower = file.name.toLowerCase();
  for (const ext of TEXT_EXTENSIONS) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

/**
 * 文本类文件以 file part 存储（UI 只显示附件卡片，不展示正文）；
 * API 侧由 expandTextFilePartsForModel 展开给模型。
 */
export const chatAttachmentAdapter: AttachmentAdapter = {
  accept: "*",
  async add({ file }) {
    return {
      id: generateId(),
      type: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      file,
      contentType: file.type || "application/octet-stream",
      content: [],
      status: { type: "requires-action", reason: "composer-send" },
    };
  },
  async send(attachment) {
    const file = attachment.file;
    if (!file) {
      throw new Error("附件缺少文件数据");
    }

    if (file.type.startsWith("image/")) {
      return {
        ...attachment,
        status: { type: "complete" },
        content: [
          {
            type: "image",
            image: await readFileAsDataURL(file),
            filename: attachment.name,
          },
        ],
      };
    }

    if (isTextLikeFile(file)) {
      const mime = file.type || "text/plain";
      return {
        ...attachment,
        status: { type: "complete" },
        content: [
          {
            type: "file",
            mimeType: mime,
            filename: attachment.name,
            data: await readFileAsDataURL(file),
          },
        ],
      };
    }

    return {
      ...attachment,
      status: { type: "complete" },
      content: [
        {
          type: "file",
          mimeType: attachment.contentType ?? "application/octet-stream",
          filename: attachment.name,
          data: await readFileAsDataURL(file),
        },
      ],
    };
  },
  async remove() {},
};
