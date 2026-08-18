"use client";

import {
  Calendar as CalendarIcon,
  Code as CodeIcon,
  FolderOpen,
  GraduationCap,
  PenLine,
} from "lucide-react";
import { useCallback, type FC } from "react";
import { useAui, useAuiState } from "@assistant-ui/store";
import { useChatMode } from "@/components/assistant-ui/contexts/chat-mode-context";
import {
  CHAT_MODES,
  type ChatModeId,
  type ChatModeSuggestion,
} from "@/lib/chat/modes";
import { cn } from "@/lib/utils";

const MODE_ICONS = {
  write: PenLine,
  learn: GraduationCap,
  code: CodeIcon,
  drive: FolderOpen,
  calendar: CalendarIcon,
} as const;

export const ModeTabs: FC = () => {
  const { mode, setMode, activeMode } = useChatMode();

  const selectMode = (id: ChatModeId) => {
    setMode(mode === id ? null : id);
  };

  return (
    <div className="flex w-full flex-col items-stretch gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CHAT_MODES.map((item) => {
          const Icon = MODE_ICONS[item.id];
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectMode(item.id)}
              className={cn(
                "flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-sm transition-colors",
                isActive
                  ? "border-[#c96442]/50 bg-white text-[#1a1a18] shadow-sm dark:bg-[#1f1e1b] dark:text-[#eee]"
                  : "border-[#E5E0D6] bg-transparent text-[#3d3a35] hover:bg-white/60 dark:border-[#3d3a35] dark:text-[#cdc9be] dark:hover:bg-[#1f1e1b]/60",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5",
                  isActive
                    ? "text-[#c96442]"
                    : "text-[#8a8780] dark:text-[#a3a098]",
                )}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {activeMode?.integrationNote ? (
        <p className="text-center text-[#8a8780] text-xs leading-relaxed dark:text-[#a3a098]">
          {activeMode.integrationNote}
        </p>
      ) : null}

      {activeMode && activeMode.suggestions.length > 0 ? (
        <ModeSuggestions suggestions={activeMode.suggestions} />
      ) : null}
    </div>
  );
};

const ModeSuggestions: FC<{ suggestions: ChatModeSuggestion[] }> = ({
  suggestions,
}) => {
  return (
    <div className="grid w-full gap-2 sm:grid-cols-3">
      {suggestions.map((item) => (
        <ModeSuggestionChip key={item.title} {...item} />
      ))}
    </div>
  );
};

const ModeSuggestionChip: FC<ChatModeSuggestion> = ({ title, prompt }) => {
  const aui = useAui();
  const disabled = useAuiState(
    (s) => s.thread.isDisabled || s.thread.isRunning,
  );

  const fillComposer = useCallback(() => {
    if (disabled) return;
    aui.composer.setText(prompt);
  }, [aui, disabled, prompt]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={fillComposer}
      className="rounded-xl border border-[#E5E0D6] bg-white/70 px-3 py-2.5 text-left text-[#3d3a35] text-sm transition-colors hover:bg-white disabled:opacity-50 dark:border-[#3d3a35] dark:bg-[#1f1e1b]/70 dark:text-[#cdc9be] dark:hover:bg-[#1f1e1b]"
    >
      {title}
    </button>
  );
};
