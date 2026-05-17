"use client";

import type { FC } from "react";
import { useChatUiTheme } from "@/components/assistant-ui/chat-ui-theme-context";
import type { ChatUiTheme } from "@/lib/chat-ui-theme";
import { cn } from "@/lib/utils";

const OPTIONS: { id: ChatUiTheme; label: string }[] = [
  { id: "claude", label: "经典" },
  { id: "shadcn", label: "现代" },
];

export const ChatUiThemeSwitch: FC<{
  className?: string;
  variant?: "default" | "claude";
}> = ({ className, variant = "default" }) => {
  const { theme, setTheme } = useChatUiTheme();
  const isClaude = variant === "claude";

  return (
    <div
      role="group"
      aria-label="界面主题"
      className={cn(
        "flex rounded-lg border p-0.5 text-sm",
        isClaude
          ? "border-[#E5E0D6] bg-[#F0ECE0]/80 font-serif dark:border-[#3d3a35] dark:bg-[#2b2a27]/80"
          : "border-border bg-muted/40",
        className,
      )}
    >
      {OPTIONS.map(({ id, label }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(id)}
            className={cn(
              "rounded-md px-2.5 py-1 transition-colors",
              isClaude
                ? active
                  ? "bg-white text-[#1a1a18] shadow-sm dark:bg-[#1f1e1b] dark:text-[#eee]"
                  : "text-[#5b5950] hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:text-[#eee]"
                : active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
