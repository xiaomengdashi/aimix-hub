"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import type { ComponentType, FC, SVGProps } from "react";
import { useChatAiProvider } from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { ClaudeIcon } from "@/components/assistant-ui/providers/claude/icon";
import { OpenAIIcon } from "@/components/assistant-ui/providers/chatgpt/icon";
import { GeminiIcon } from "@/components/assistant-ui/providers/gemini/icon";
import { GenericModelIcon } from "@/components/assistant-ui/providers/shared/vendor-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import {
  CHAT_AI_PROVIDER_OPTIONS,
  getProviderDisplayName,
  type ChatAiProvider,
} from "@/lib/chat/provider";
import { cn } from "@/lib/utils";
import {
  providerSwitchCheckClass,
  providerSwitchTriggerClass,
  providerSwitchVariantForProvider,
  type ProviderSwitchVariant,
} from "./provider-switch-styles";

const PROVIDER_ICONS: Record<
  ChatAiProvider,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  chatgpt: OpenAIIcon,
  claude: ClaudeIcon,
  gemini: GeminiIcon,
  other: GenericModelIcon,
};

const ProviderOptionIcon: FC<{
  provider: ChatAiProvider;
  className?: string;
}> = ({ provider, className }) => {
  const Icon = PROVIDER_ICONS[provider];
  return <Icon className={cn("size-4 shrink-0", className)} aria-hidden />;
};

export const ProviderSwitch: FC<{
  className?: string;
  variant?: ProviderSwitchVariant;
  fullWidth?: boolean;
}> = ({ className, variant: variantProp, fullWidth = false }) => {
  const { provider, setProvider } = useChatAiProvider();
  const variant = variantProp ?? providerSwitchVariantForProvider(provider);
  const currentLabel = getProviderDisplayName(provider);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={providerSwitchTriggerClass(variant, fullWidth, className)}
        aria-label={`AI 服务：${currentLabel}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <ProviderOptionIcon provider={provider} />
          <span
            className={cn(
              "truncate",
              variant === "claude" && "font-serif",
            )}
          >
            {currentLabel}
          </span>
        </span>
        <ChevronDownIcon width={16} height={16} className="shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className={cn(fullWidth && "min-w-[var(--radix-dropdown-menu-trigger-width)]")}
      >
        {CHAT_AI_PROVIDER_OPTIONS.map(({ id, label }) => (
          <DropdownMenuItem
            key={id}
            onSelect={() => setProvider(id)}
            className="flex cursor-pointer items-center gap-2.5"
            icon={
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center",
                  providerSwitchCheckClass(variant),
                )}
              >
                {provider === id ? <CheckIcon /> : null}
              </span>
            }
          >
            <ProviderOptionIcon provider={id} />
            <span className={cn(variant === "claude" && "font-serif")}>
              {label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
