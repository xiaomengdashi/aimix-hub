"use client";

import type { FC } from "react";
import { useChatAiProvider } from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { CHAT_AI_PROVIDER_OPTIONS } from "@/lib/chat/provider";
import {
  providerSwitchButtonClass,
  providerSwitchRootClass,
  providerSwitchVariantForProvider,
  type ProviderSwitchVariant,
} from "./provider-switch-styles";

export const ProviderSwitch: FC<{
  className?: string;
  variant?: ProviderSwitchVariant;
  fullWidth?: boolean;
}> = ({ className, variant: variantProp, fullWidth = false }) => {
  const { provider, setProvider } = useChatAiProvider();
  const variant = variantProp ?? providerSwitchVariantForProvider(provider);

  return (
    <div
      role="group"
      aria-label="AI 服务"
      className={providerSwitchRootClass(variant, fullWidth, className)}
    >
      {CHAT_AI_PROVIDER_OPTIONS.map(({ id, label }) => {
        const active = provider === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => setProvider(id)}
            className={providerSwitchButtonClass(variant, active, fullWidth)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
