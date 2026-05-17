"use client";

import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const VOICE_FEATURE_DISABLED_TITLE = "语音功能暂未开放";

export const VoicePlaceholderButton: FC<{
  className?: string;
  title?: string;
  "aria-label"?: string;
  children: ReactNode;
}> = ({
  className,
  title = VOICE_FEATURE_DISABLED_TITLE,
  "aria-label": ariaLabel = "语音功能暂未开放",
  children,
}) => (
  <button
    type="button"
    disabled
    aria-disabled="true"
    title={title}
    aria-label={ariaLabel}
    className={cn("cursor-not-allowed opacity-50", className)}
  >
    {children}
  </button>
);
