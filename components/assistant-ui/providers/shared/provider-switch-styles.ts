import type { ChatAiProvider } from "@/lib/chat/provider";
import { cn } from "@/lib/utils";

export type ProviderSwitchVariant = "default" | "claude" | "chatgpt" | "gemini";

const VARIANT_ROOT: Record<ProviderSwitchVariant, string> = {
  default: "border-border bg-muted/40",
  claude:
    "border-[#E5E0D6] bg-[#F0ECE0]/80 font-serif dark:border-[#3d3a35] dark:bg-[#2b2a27]/80",
  chatgpt:
    "border-[#e5e5e5] bg-[#f7f7f7] dark:border-transparent dark:bg-[#303030]",
  gemini:
    "border-[#dadce0] bg-white shadow-sm dark:border-[#3c4043] dark:bg-[#1e1f20]",
};

const VARIANT_ACTIVE: Record<ProviderSwitchVariant, string> = {
  default: "bg-background text-foreground shadow-sm",
  claude:
    "bg-white text-[#1a1a18] shadow-sm dark:bg-[#1f1e1b] dark:text-[#eee]",
  chatgpt:
    "bg-white text-[#0d0d0d] shadow-sm dark:bg-[#424242] dark:text-[#ececec]",
  gemini:
    "bg-[#e8f0fe] text-[#1f1f1f] dark:bg-[#394457] dark:text-[#e3e3e3]",
};

const VARIANT_INACTIVE: Record<ProviderSwitchVariant, string> = {
  default: "text-muted-foreground hover:text-foreground",
  claude:
    "text-[#5b5950] hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:text-[#eee]",
  chatgpt:
    "text-[#5d5d5d] hover:text-[#0d0d0d] dark:text-[#cdcdcd] dark:hover:text-white",
  gemini:
    "text-[#70757a] hover:text-[#1f1f1f] dark:text-[#9aa0a6] dark:hover:text-[#e3e3e3]",
};

export function providerSwitchRootClass(
  variant: ProviderSwitchVariant,
  fullWidth: boolean,
  className?: string,
) {
  return cn(
    "flex flex-wrap gap-0.5 rounded-lg border p-0.5 text-xs",
    fullWidth && "w-full",
    VARIANT_ROOT[variant],
    className,
  );
}

export function providerSwitchButtonClass(
  variant: ProviderSwitchVariant,
  active: boolean,
  fullWidth: boolean,
) {
  return cn(
    "rounded-md px-2 py-1 transition-colors",
    fullWidth && "min-w-0 flex-1",
    active ? VARIANT_ACTIVE[variant] : VARIANT_INACTIVE[variant],
  );
}

export function providerSwitchVariantForProvider(
  provider: ChatAiProvider,
): ProviderSwitchVariant {
  if (provider === "claude") return "claude";
  if (provider === "chatgpt") return "chatgpt";
  if (provider === "gemini") return "gemini";
  return "default";
}
