export type ChatAiProvider = "claude" | "chatgpt" | "gemini" | "other";

export const CHAT_AI_PROVIDER_STORAGE_KEY = "claude-clone:ai-provider";
/** @deprecated legacy theme storage key */
export const LEGACY_CHAT_UI_THEME_STORAGE_KEY = "claude-clone:ui-theme";

export const DEFAULT_CHAT_AI_PROVIDER: ChatAiProvider = "claude";

export const CHAT_AI_PROVIDER_OPTIONS: {
  id: ChatAiProvider;
  label: string;
}[] = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "other", label: "其他" },
];

export function isChatAiProvider(value: string): value is ChatAiProvider {
  return (
    value === "claude" ||
    value === "chatgpt" ||
    value === "gemini" ||
    value === "other"
  );
}

function migrateLegacyStoredValue(stored: string): ChatAiProvider | null {
  if (isChatAiProvider(stored)) return stored;
  if (stored === "claude") return "claude";
  if (stored === "shadcn") return "chatgpt";
  return null;
}

export function getStoredChatAiProvider(): ChatAiProvider {
  if (typeof window === "undefined") {
    return DEFAULT_CHAT_AI_PROVIDER;
  }
  const stored =
    localStorage.getItem(CHAT_AI_PROVIDER_STORAGE_KEY) ??
    localStorage.getItem(LEGACY_CHAT_UI_THEME_STORAGE_KEY);
  if (!stored) return DEFAULT_CHAT_AI_PROVIDER;
  return migrateLegacyStoredValue(stored) ?? DEFAULT_CHAT_AI_PROVIDER;
}

export function setStoredChatAiProvider(provider: ChatAiProvider): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_AI_PROVIDER_STORAGE_KEY, provider);
}

export function getProviderDisplayName(provider: ChatAiProvider): string {
  return (
    CHAT_AI_PROVIDER_OPTIONS.find((o) => o.id === provider)?.label ?? provider
  );
}

