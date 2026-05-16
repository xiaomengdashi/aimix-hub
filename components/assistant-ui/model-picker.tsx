"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type { FC } from "react";
import { useChatModel } from "@/components/assistant-ui/chat-model-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CHAT_MODELS, getChatModel } from "@/lib/chat-models";
import { cn } from "@/lib/utils";

export const ModelPicker: FC<{ className?: string }> = ({ className }) => {
  const { model, setModel } = useChatModel();
  const current = getChatModel(model);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-9 gap-1.5 px-3 font-medium", className)}
          aria-label="选择模型"
        >
          <span className="max-w-[10rem] truncate">
            {current?.name ?? model}
          </span>
          <ChevronDownIcon className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64">
        {CHAT_MODELS.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onSelect={() => setModel(m.id)}
            className="flex cursor-pointer items-start gap-3 py-2"
          >
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-primary">
              {m.id === model ? (
                <CheckIcon className="size-4" />
              ) : null}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium text-sm">{m.name}</span>
              <span className="text-muted-foreground text-xs leading-snug">
                {m.description}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
