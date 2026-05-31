import { cn } from "@/lib/utils";

/** 操作栏始终占位，仅在 hover / focus-within 时可见、可点击 */
export const messageActionBarHoverVisibilityClass =
  "pointer-events-none opacity-0 transition-opacity group-hover/message:pointer-events-auto group-hover/message:opacity-100 group-focus-within/message:pointer-events-auto group-focus-within/message:opacity-100";

export const userMessageActionBarRootClass = cn(
  "flex min-h-8 shrink-0 items-center gap-0.5",
  messageActionBarHoverVisibilityClass,
);

export const assistantMessageActionBarRootClass = cn(
  "flex min-h-8 items-center gap-0.5",
  messageActionBarHoverVisibilityClass,
);
