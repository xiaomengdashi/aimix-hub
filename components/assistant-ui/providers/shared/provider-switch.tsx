"use client";

import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import type { ComponentType, FC, SVGProps } from "react";
import { useAppNav } from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { ClaudeIcon } from "@/components/assistant-ui/providers/claude/icon";
import { OpenAIIcon } from "@/components/assistant-ui/providers/chatgpt/icon";
import { GeminiIcon } from "@/components/assistant-ui/providers/gemini/icon";
import { ImageAppIcon } from "@/components/assistant-ui/providers/image/icon";
import { GenericModelIcon } from "@/components/assistant-ui/providers/shared/vendor-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import { APP_NAV_OPTIONS, getAppDisplayName, type AppId } from "@/lib/chat/app-id";
import { cn } from "@/lib/utils";
import {
  providerSwitchCheckClass,
  providerSwitchTriggerClass,
  providerSwitchVariantForApp,
  type ProviderSwitchVariant,
} from "./provider-switch-styles";

const APP_ICONS: Record<AppId, ComponentType<SVGProps<SVGSVGElement>>> = {
  chatgpt: OpenAIIcon,
  claude: ClaudeIcon,
  gemini: GeminiIcon,
  image: ImageAppIcon,
  other: GenericModelIcon,
};

const AppOptionIcon: FC<{
  appId: AppId;
  className?: string;
}> = ({ appId, className }) => {
  const Icon = APP_ICONS[appId];
  return <Icon className={cn("size-4 shrink-0", className)} aria-hidden />;
};

export const ProviderSwitch: FC<{
  className?: string;
  variant?: ProviderSwitchVariant;
  fullWidth?: boolean;
}> = ({ className, variant: variantProp, fullWidth = false }) => {
  const { appId, setAppId } = useAppNav();
  const variant = variantProp ?? providerSwitchVariantForApp(appId);
  const currentLabel = getAppDisplayName(appId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={providerSwitchTriggerClass(variant, fullWidth, className)}
        aria-label={`AI 服务：${currentLabel}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <AppOptionIcon appId={appId} />
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
        {APP_NAV_OPTIONS.map(({ id, label }) => (
          <DropdownMenuItem
            key={id}
            onSelect={() => setAppId(id)}
            className="flex cursor-pointer items-center gap-2.5"
            icon={
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center",
                  providerSwitchCheckClass(variant),
                )}
              >
                {appId === id ? <CheckIcon /> : null}
              </span>
            }
          >
            <AppOptionIcon appId={id} />
            <span className={cn(variant === "claude" && "font-serif")}>
              {label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
