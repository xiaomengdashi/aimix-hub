import {
  CHAT_AI_PROVIDER_OPTIONS,
  CHAT_AI_PROVIDER_STORAGE_KEY,
  DEFAULT_CHAT_AI_PROVIDER,
  LEGACY_CHAT_UI_THEME_STORAGE_KEY,
  type ChatAiProvider,
  isChatAiProvider,
} from "@/lib/chat/provider";

/** 主导航应用：对话 + 绘图 + 其他模型 */
export type AppId = ChatAiProvider | "image";

export const APP_NAV_OPTIONS: { id: AppId; label: string }[] = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "other", label: "其他" },
  { id: "image", label: "绘图" },
];

export function isAppId(value: string): value is AppId {
  return value === "image" || isChatAiProvider(value);
}

export function isImageApp(appId: AppId): appId is "image" {
  return appId === "image";
}

export function getAppDisplayName(appId: AppId): string {
  return (
    APP_NAV_OPTIONS.find((o) => o.id === appId)?.label ??
    CHAT_AI_PROVIDER_OPTIONS.find((o) => o.id === appId)?.label ??
    appId
  );
}

function migrateLegacyStoredValue(stored: string): AppId | null {
  if (isAppId(stored)) return stored;
  if (stored === "shadcn") return "chatgpt";
  return null;
}

export function getStoredAppId(): AppId {
  if (typeof window === "undefined") {
    return DEFAULT_CHAT_AI_PROVIDER;
  }
  const stored =
    localStorage.getItem(CHAT_AI_PROVIDER_STORAGE_KEY) ??
    localStorage.getItem(LEGACY_CHAT_UI_THEME_STORAGE_KEY);
  if (!stored) return DEFAULT_CHAT_AI_PROVIDER;
  return migrateLegacyStoredValue(stored) ?? DEFAULT_CHAT_AI_PROVIDER;
}

export function setStoredAppId(appId: AppId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_AI_PROVIDER_STORAGE_KEY, appId);
}
