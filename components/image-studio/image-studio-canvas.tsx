"use client";

import { Download, Loader2 } from "lucide-react";
import type { FC } from "react";
import { IMAGE_PROMPT_SUGGESTIONS } from "@/lib/image-generation/prompt-suggestions";
import { cn } from "@/lib/utils";
import { ImageAppLogo } from "@/components/assistant-ui/providers/image/icon";
import { Button } from "@/components/ui/button";
import type { ImageSessionSummary } from "@/lib/image-generation/session";
import {
  formatPixelCount,
  getImageSizesForModel,
  IMAGE_FORMATS,
  IMAGE_QUALITIES,
} from "@/lib/image-generation/settings";

type ImageStudioCanvasProps = {
  session: ImageSessionSummary | null;
  isGenerating: boolean;
  generatingPrompt?: string;
  onSelectSuggestion?: (prompt: string) => void;
};

export const ImageStudioCanvas: FC<ImageStudioCanvasProps> = ({
  session,
  isGenerating,
  generatingPrompt,
  onSelectSuggestion,
}) => {
  if (isGenerating) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="relative flex size-24 items-center justify-center rounded-2xl border border-[#d4e4ff] bg-white shadow-lg dark:border-[#3d4f6f] dark:bg-[#1a2332]">
          <Loader2 className="size-10 animate-spin text-[#7c3aed]" />
        </div>
        <div className="max-w-lg text-center">
          <p className="font-medium text-[#0d3b8c] text-lg dark:text-[#b8d4ff]">正在生成图像…</p>
          <p className="mt-2 text-[#3d5a8c] text-sm dark:text-[#8ab4f8]">通常需要约 1 分钟</p>
          {generatingPrompt ? (
            <p className="mt-4 line-clamp-3 rounded-xl bg-white/60 px-4 py-3 text-sm text-[#3d5a8c] dark:bg-[#1a2332]/60 dark:text-[#8ab4f8]">{generatingPrompt}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
        <ImageAppLogo variant="logo" className="drop-shadow-md" />
        <header>
          <h2 className="bg-gradient-to-r from-[#5b21b6] via-[#be185d] to-[#0e7490] bg-clip-text text-xl font-semibold text-transparent dark:from-[#ddd6fe] dark:via-[#fbcfe8] dark:to-[#a5f3fc]">
            开始你的创作
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#3d5a8c] dark:text-[#8ab4f8]">
            填写提示词后点击生成，每次都会创建新会话
          </p>
        </header>
        {onSelectSuggestion ? (
          <section className="w-full max-w-lg px-2">
            <p className="mb-3 text-[#6b8fc7] text-xs tracking-wide">试试这些灵感</p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {IMAGE_PROMPT_SUGGESTIONS.map((item) => (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => onSelectSuggestion(item.prompt)}
                    className={cn(
                      "flex h-full w-full flex-col gap-1 rounded-2xl border border-[#d4e4ff] bg-white/90 px-4 py-3 text-left shadow-sm transition-all",
                      "hover:border-[#a78bfa] hover:bg-white hover:shadow-md",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]/40",
                      "dark:border-[#3d4f6f] dark:bg-[#1a2332]/90 dark:hover:border-[#5a7ab0] dark:hover:bg-[#243044]",
                    )}
                  >
                    <span className="font-medium text-[#0d3b8c] text-sm dark:text-[#b8d4ff]">
                      {item.title}
                    </span>
                    <span className="line-clamp-2 text-[#6b8fc7] text-xs leading-relaxed dark:text-[#8ab4f8]">
                      {item.prompt}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </section>
    );
  }

  if (session.status === "failed") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-medium text-destructive">生成失败</p>
        <p className="max-w-md text-sm text-muted-foreground">{session.error ?? "未知错误"}</p>
        <p className="mt-2 max-w-xl text-sm text-[#3d5a8c] dark:text-[#8ab4f8]">{session.prompt}</p>
      </div>
    );
  }

  if (session.status === "generating" || !session.imageUrl) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <Loader2 className="size-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  const sizeMeta = getImageSizesForModel(session.model).find(
    (s) => s.value === session.size,
  );
  const sizeLabel = sizeMeta
    ? `${sizeMeta.label}（${sizeMeta.pixels}）`
    : session.size === "auto"
      ? "自动"
      : `${session.size}（${formatPixelCount(session.size)}）`;
  const qualityLabel = IMAGE_QUALITIES.find((q) => q.value === session.quality)?.label ?? session.quality;
  const formatLabel = IMAGE_FORMATS.find((f) => f.value === session.format)?.label ?? session.format;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
        <div className="relative w-full max-w-4xl">
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/20 via-pink-500/15 to-cyan-500/20 blur-2xl" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={session.imageUrl}
            alt={session.prompt}
            className="relative mx-auto max-h-[min(72dvh,900px)] w-auto max-w-full rounded-2xl border border-white/40 object-contain shadow-2xl dark:border-[#3d4f6f]/50"
          />
        </div>
      </div>
      <div className="shrink-0 border-t border-[#d4e4ff]/80 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-[#2a3a52] dark:bg-[#0f1419]/70 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#0d3b8c] dark:text-[#b8d4ff]">提示词</p>
            <p className="mt-1 text-sm leading-relaxed text-[#3d5a8c] dark:text-[#8ab4f8]">{session.prompt}</p>
            <p className="mt-2 text-xs text-[#6b8fc7]">{session.modelName ?? session.model} · {sizeLabel} · {qualityLabel} · {formatLabel}</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <a href={session.imageUrl} download target="_blank" rel="noreferrer">
              <Download className="size-4" />
              下载图片
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
