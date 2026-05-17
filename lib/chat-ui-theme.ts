export type ChatUiTheme = "claude" | "shadcn";

export const CHAT_UI_THEME_STORAGE_KEY = "claude-clone:ui-theme";

export const DEFAULT_CHAT_UI_THEME: ChatUiTheme = "shadcn";

export function isChatUiTheme(value: string): value is ChatUiTheme {
  return value === "claude" || value === "shadcn";
}

export function getStoredChatUiTheme(): ChatUiTheme {
  if (typeof window === "undefined") {
    return DEFAULT_CHAT_UI_THEME;
  }
  const stored = localStorage.getItem(CHAT_UI_THEME_STORAGE_KEY);
  return stored && isChatUiTheme(stored) ? stored : DEFAULT_CHAT_UI_THEME;
}

export function setStoredChatUiTheme(theme: ChatUiTheme): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_UI_THEME_STORAGE_KEY, theme);
}
