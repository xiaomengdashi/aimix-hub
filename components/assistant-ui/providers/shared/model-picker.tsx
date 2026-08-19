"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import type { FC } from "react";
import { useChatModel } from "@/components/assistant-ui/contexts/chat-model-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import { getChatModel } from "@/lib/chat/models";
import { formatModelsDevPrice } from "@/lib/chat/format-model-price";
import { cn } from "@/lib/utils";

export type ProviderModelPickerVariant =
  | "claude"
  | "chatgpt"
  | "gemini"
  | "grok"
  | "default";

const TRIGGER_CLASS: Record<ProviderModelPickerVariant, string> = {
  claude:
    "flex h-8 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-[#1a1a18] text-sm transition hover:bg-[#1a1a18]/5 dark:text-[#eee] dark:hover:bg-white/5",
  chatgpt:
    "flex h-9 max-w-[9rem] items-center gap-1 truncate rounded-full px-3 text-[#0d0d0d] text-sm transition-colors hover:bg-[#0d0d0d]/5 dark:text-[#ececec] dark:hover:bg-white/10",
  gemini:
    "flex h-10 max-w-[9rem] items-center gap-1 truncate rounded-full px-3 text-[#444746] text-sm transition hover:bg-[#444746]/8 dark:text-[#c4c7c5] dark:hover:bg-[#c4c7c5]/8",
  grok:
    "mb-0.5 flex h-9 max-w-[9rem] shrink-0 items-center gap-1 truncate rounded-full px-2.5 text-[#0d0d0d] text-sm hover:bg-[#f0f0f0] dark:text-white dark:hover:bg-[#2a2a2a]",
  default:
    "flex h-9 max-w-[10rem] items-center gap-1 truncate rounded-md border border-border bg-background px-3 text-sm hover:bg-muted",
};

const CHECK_CLASS: Record<ProviderModelPickerVariant, string> = {
  claude: "text-[#c96442]",
  chatgpt: "text-[#0d0d0d] dark:text-[#ececec]",
  gemini: "text-[#1a73e8] dark:text-[#8ab4f8]",
  grok: "text-[#0d0d0d] dark:text-white",
  default: "text-primary",
};

export const ProviderModelPicker: FC<{
  variant: ProviderModelPickerVariant;
  className?: string;
  labelClassName?: string;
}> = ({ variant, className, labelClassName }) => {
  const { model, setModel, models, modelsLoading } = useChatModel();
  const current = getChatModel(model);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(TRIGGER_CLASS[variant], className)}
        disabled={modelsLoading || models.length === 0}
      >
        <span className={cn("truncate", labelClassName)}>
          {modelsLoading
            ? "加载模型…"
            : (current?.name ?? model ?? "选择模型")}
        </span>
        <ChevronDownIcon width={16} height={16} className="shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-72">
        {models.length === 0 ? (
          <div className="px-3 py-2 text-muted-foreground text-xs">
            暂无可用模型
          </div>
        ) : (
          models.map((m) => (
            <DropdownMenuItem
              key={m.id}
              onSelect={() => setModel(m.id)}
              className="flex cursor-pointer items-start gap-3"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center",
                  CHECK_CLASS[variant],
                )}
              >
                {m.id === model ? <CheckIcon /> : null}
              </span>
              <ModelOptionLabel
                name={m.name}
                description={m.description}
                price={formatModelsDevPrice(
                  m.inputPricePerMillion,
                  m.outputPricePerMillion,
                )}
              />
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ModelOptionLabel: FC<{
  name: string;
  description: string;
  price: string;
}> = ({ name, description, price }) => (
  <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-foreground text-sm">{name}</span>
      <span className="text-muted-foreground text-xs leading-snug">
        {description}
      </span>
    </span>
    <span className="shrink-0 pt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
      {price}
    </span>
  </span>
);
