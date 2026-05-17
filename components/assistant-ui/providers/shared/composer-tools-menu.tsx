"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import type { LucideIcon } from "lucide-react";
import { SlidersHorizontal } from "lucide-react";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import type { FC } from "react";
import { useComposerTool } from "@/components/assistant-ui/composer-tool-context";
import { useChatModel } from "@/components/assistant-ui/chat-model-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import {
  getComposerTool,
  type ComposerToolId,
} from "@/lib/composer-tools";
import { cn } from "@/lib/utils";

export type ComposerToolsMenuItem = {
  id: ComposerToolId;
  label: string;
  Icon: LucideIcon;
};

type ComposerToolsMenuVariant = "chatgpt" | "gemini";

const TRIGGER_CLASS: Record<ComposerToolsMenuVariant, string> = {
  chatgpt:
    "hidden h-9 items-center gap-1.5 rounded-full px-3 text-[#5d5d5d] text-sm transition-colors hover:bg-[#0d0d0d]/5 hover:text-[#0d0d0d] sm:flex dark:text-[#cdcdcd] dark:hover:bg-white/10 dark:hover:text-white",
  gemini:
    "flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-sm transition hover:bg-[#444746]/8 dark:hover:bg-[#c4c7c5]/8",
};

export const ComposerToolsMenu: FC<{
  variant: ComposerToolsMenuVariant;
  tools: ComposerToolsMenuItem[];
  align?: "start" | "end";
}> = ({ variant, tools, align = "end" }) => {
  const { tool, toggleTool } = useComposerTool();
  const { models } = useChatModel();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={TRIGGER_CLASS[variant]}>
        {variant === "chatgpt" ? (
          <SlidersHorizontal className="size-4" />
        ) : (
          <MixerHorizontalIcon width={16} height={16} />
        )}
        <span>Tools</span>
        {variant === "chatgpt" ? (
          <ChevronDownIcon className="size-3.5 opacity-70" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-56">
        {tools.map(({ id, label, Icon }) => {
          const def = getComposerTool(id);
          const needsModel = def.modelId != null;
          const modelMissing =
            needsModel && !models.some((m) => m.id === def.modelId);
          const isActive = tool === id;

          return (
            <DropdownMenuItem
              key={id}
              disabled={modelMissing}
              icon={<Icon className="size-4" />}
              className={cn(
                "text-foreground text-sm",
                isActive && "bg-accent/60",
              )}
              onSelect={(e) => {
                e.preventDefault();
                if (!modelMissing) toggleTool(id);
              }}
            >
              <span className="flex flex-1 items-center justify-between gap-2">
                <span>{label}</span>
                {isActive ? (
                  <CheckIcon className="size-4 shrink-0 opacity-70" />
                ) : null}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
