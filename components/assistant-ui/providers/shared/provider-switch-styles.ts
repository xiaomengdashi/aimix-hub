import type { AppId } from "@/lib/chat/app-id";
import type { ChatAiProvider } from "@/lib/chat/provider";
import { cn } from "@/lib/utils";

export type ProviderSwitchVariant =
  | "default"
  | "claude"
  | "chatgpt"
  | "gemini"
  | "image";

const TRIGGER_CLASS: Record<ProviderSwitchVariant, string> = {
  default:
    "border-border bg-muted/40 text-foreground hover:bg-muted/60",
  claude:
    "border-[#E5E0D6] bg-[#F0ECE0]/80 font-serif text-[#1a1a18] hover:bg-[#F0ECE0] dark:border-[#3d3a35] dark:bg-[#2b2a27]/80 dark:text-[#eee] dark:hover:bg-[#2b2a27]",
  chatgpt:
    "border-[#e5e5e5] bg-[#f7f7f7] text-[#0d0d0d] hover:bg-[#efefef] dark:border-transparent dark:bg-[#303030] dark:text-[#ececec] dark:hover:bg-[#3a3a3a]",
  gemini:
    "border-[#dadce0] bg-white text-[#1f1f1f] shadow-sm hover:bg-[#f8f9fa] dark:border-[#3c4043] dark:bg-[#1e1f20] dark:text-[#e3e3e3] dark:hover:bg-[#282a2c]",
  image:
    "border-[#d4e4ff] bg-[#f0f6ff] text-[#0d3b8c] hover:bg-[#e6efff] dark:border-[#3d4f6f] dark:bg-[#1a2332] dark:text-[#b8d4ff] dark:hover:bg-[#243044]",
};

const CHECK_CLASS: Record<ProviderSwitchVariant, string> = {
  default: "text-primary",
  claude: "text-[#c96442]",
  chatgpt: "text-[#0d0d0d] dark:text-[#ececec]",
  gemini: "text-[#1a73e8] dark:text-[#8ab4f8]",
  image: "text-[#1a73e8] dark:text-[#8ab4f8]",
};

export function providerSwitchTriggerClass(
  variant: ProviderSwitchVariant,
  fullWidth: boolean,
  className?: string,
) {
  return cn(
    "flex h-9 items-center gap-2 rounded-lg border px-2.5 text-sm transition-colors",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    fullWidth ? "w-full justify-between" : "max-w-[12rem]",
    TRIGGER_CLASS[variant],
    className,
  );
}

export function providerSwitchCheckClass(variant: ProviderSwitchVariant) {
  return CHECK_CLASS[variant];
}

export function providerSwitchVariantForApp(appId: AppId): ProviderSwitchVariant {
  if (appId === "claude") return "claude";
  if (appId === "chatgpt") return "chatgpt";
  if (appId === "gemini") return "gemini";
  if (appId === "image") return "image";
  return "default";
}

/** @deprecated 使用 providerSwitchVariantForApp */
export function providerSwitchVariantForProvider(
  provider: ChatAiProvider,
): ProviderSwitchVariant {
  return providerSwitchVariantForApp(provider);
}
