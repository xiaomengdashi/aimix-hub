/** @deprecated Use `@/lib/chat/provider` instead */
export {
  type ChatAiProvider as ChatUiTheme,
  CHAT_AI_PROVIDER_STORAGE_KEY as CHAT_UI_THEME_STORAGE_KEY,
  DEFAULT_CHAT_AI_PROVIDER as DEFAULT_CHAT_UI_THEME,
  getStoredChatAiProvider as getStoredChatUiTheme,
  setStoredChatAiProvider as setStoredChatUiTheme,
  isChatAiProvider as isChatUiTheme,
} from "@/lib/chat/provider";
