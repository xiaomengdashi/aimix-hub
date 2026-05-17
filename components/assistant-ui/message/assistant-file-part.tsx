"use client";

import type { FileMessagePartComponent } from "@assistant-ui/react";
import { useMessagePartFile } from "@assistant-ui/react";

function resolveFileSrc(data: string, mimeType: string): string {
  if (
    data.startsWith("data:") ||
    data.startsWith("http://") ||
    data.startsWith("https://") ||
    data.startsWith("/")
  ) {
    return data;
  }
  return `data:${mimeType};base64,${data}`;
}

/** 助手消息中的文件/生成图片展示 */
export const AssistantFilePart: FileMessagePartComponent = () => {
  const { data, mimeType, filename } = useMessagePartFile();

  if (!data) return null;

  const media = mimeType ?? "image/png";
  const src = resolveFileSrc(data, media);

  if (media.startsWith("image/")) {
    return (
      <figure className="aui-generated-image my-2 max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={filename ?? "生成的图片"}
          className="max-h-[min(70dvh,720px)] w-auto max-w-full rounded-xl border border-border/60 object-contain shadow-sm"
        />
      </figure>
    );
  }

  return (
    <a href={src} download={filename} className="text-primary text-sm underline">
      {filename ?? "下载文件"}
    </a>
  );
};
