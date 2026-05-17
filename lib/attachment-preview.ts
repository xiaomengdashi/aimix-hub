import type { ThreadUserMessagePart } from "@assistant-ui/core";
import {
  decodeDataUrlText,
  isTextLikeFilename,
  isTextMediaType,
  readFileAsDataURL,
} from "@/lib/attachment-data-url";

const TEXT_PREVIEW_MAX_CHARS = 512_000;

export type AttachmentPreview =
  | { kind: "image"; src: string; filename: string }
  | { kind: "text"; text: string; filename: string; mimeType: string; truncated: boolean }
  | { kind: "pdf"; src: string; filename: string }
  | { kind: "binary"; src: string; filename: string; mimeType: string };

type AttachmentLike = {
  type: string;
  name: string;
  content?: readonly ThreadUserMessagePart[];
  file?: File;
  contentType?: string;
};

async function previewFromFile(file: File, filename: string): Promise<AttachmentPreview> {
  if (file.type.startsWith("image/")) {
    return {
      kind: "image",
      src: await readFileAsDataURL(file),
      filename,
    };
  }

  if (isTextLikeFilename(filename, file.type)) {
    const full = await file.text();
    const truncated = full.length > TEXT_PREVIEW_MAX_CHARS;
    return {
      kind: "text",
      text: truncated ? full.slice(0, TEXT_PREVIEW_MAX_CHARS) : full,
      filename,
      mimeType: file.type || "text/plain",
      truncated,
    };
  }

  if (file.type === "application/pdf") {
    return {
      kind: "pdf",
      src: await readFileAsDataURL(file),
      filename,
    };
  }

  return {
    kind: "binary",
    src: await readFileAsDataURL(file),
    filename,
    mimeType: file.type || "application/octet-stream",
  };
}

function previewFromFilePart(
  part: Extract<ThreadUserMessagePart, { type: "file" }>,
  fallbackName: string,
): AttachmentPreview {
  const filename = part.filename ?? fallbackName;
  const mime = part.mimeType;

  if (isTextMediaType(mime) || isTextLikeFilename(filename, mime)) {
    const full = decodeDataUrlText(part.data);
    if (full == null) {
      throw new Error("无法解析文本附件");
    }
    const truncated = full.length > TEXT_PREVIEW_MAX_CHARS;
    return {
      kind: "text",
      text: truncated ? full.slice(0, TEXT_PREVIEW_MAX_CHARS) : full,
      filename,
      mimeType: mime,
      truncated,
    };
  }

  if (mime === "application/pdf") {
    return { kind: "pdf", src: part.data, filename };
  }

  return { kind: "binary", src: part.data, filename, mimeType: mime };
}

export async function resolveAttachmentPreview(
  attachment: AttachmentLike,
): Promise<AttachmentPreview> {
  const imagePart = attachment.content?.find(
    (part): part is Extract<ThreadUserMessagePart, { type: "image" }> =>
      part.type === "image",
  );
  if (imagePart?.image) {
    return {
      kind: "image",
      src: imagePart.image,
      filename: imagePart.filename ?? attachment.name,
    };
  }

  if (attachment.type === "image" && attachment.file) {
    return previewFromFile(attachment.file, attachment.name);
  }

  const filePart = attachment.content?.find(
    (part): part is Extract<ThreadUserMessagePart, { type: "file" }> =>
      part.type === "file",
  );
  if (filePart) {
    return previewFromFilePart(filePart, attachment.name);
  }

  if (attachment.file) {
    return previewFromFile(attachment.file, attachment.name);
  }

  throw new Error("无法预览此附件");
}
