"use client";

import type { FC, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const previewDialogClassName =
  "aui-image-preview-dialog-content max-h-[98dvh] w-auto max-w-[98vw] overflow-hidden border-[#d4e4ff]/40 bg-[#0a0e14]/95 p-1 shadow-2xl sm:max-w-[98vw] dark:border-[#3d4f6f]/50 [&>button]:rounded-full [&>button]:bg-white/80 [&>button]:p-1 [&>button]:opacity-100";

type ImagePreviewDialogProps = {
  src: string;
  alt: string;
  title?: string;
  triggerClassName?: string;
  imageClassName?: string;
  children?: ReactNode;
};

/** 点击缩略图弹出近全屏预览，供绘图工作台、助手消息与控制台共用。 */
export const ImagePreviewDialog: FC<ImagePreviewDialogProps> = ({
  src,
  alt,
  title,
  triggerClassName,
  imageClassName,
  children,
}) => (
  <Dialog>
    <DialogTrigger asChild>
      {children ?? (
        <button
          type="button"
          aria-label="放大查看图片"
          className={cn(
            "aui-image-preview-trigger cursor-zoom-in rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]/40",
            triggerClassName,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className={imageClassName} />
        </button>
      )}
    </DialogTrigger>
    <DialogContent className={previewDialogClassName}>
      <DialogTitle
        className={
          title
            ? "aui-image-preview-title truncate pe-8 text-base font-medium"
            : "sr-only"
        }
      >
        {title ?? "图片预览"}
      </DialogTitle>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="aui-image-preview-image mx-auto max-h-[96dvh] w-auto max-w-[96vw] rounded-lg object-contain"
      />
    </DialogContent>
  </Dialog>
);
