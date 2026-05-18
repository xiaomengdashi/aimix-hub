import type { FC, ReactNode } from "react";
import type { AppId } from "@/lib/chat/app-id";
import type { ChatAiProvider } from "@/lib/chat/provider";
import { ClaudeLayout, ClaudeThread } from "@/components/assistant-ui/providers/claude";
import { ChatGPTLayout, ChatGPTThread } from "@/components/assistant-ui/providers/chatgpt";
import { GeminiLayout, GeminiThread } from "@/components/assistant-ui/providers/gemini";
import { ImageLayout, ImageThread } from "@/components/assistant-ui/providers/image";
import { OtherLayout, OtherThread } from "@/components/assistant-ui/providers/other";

export type ProviderLayoutProps = {
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
};

export type ProviderUI = {
  Layout: FC<ProviderLayoutProps>;
  Thread: FC;
};

export const PROVIDER_UI: Record<ChatAiProvider, ProviderUI> = {
  claude: { Layout: ClaudeLayout, Thread: ClaudeThread },
  chatgpt: { Layout: ChatGPTLayout, Thread: ChatGPTThread },
  gemini: { Layout: GeminiLayout, Thread: GeminiThread },
  other: { Layout: OtherLayout, Thread: OtherThread },
};

export const APP_UI: Record<AppId, ProviderUI> = {
  ...PROVIDER_UI,
  image: { Layout: ImageLayout, Thread: ImageThread },
};

export function getAppUI(appId: AppId): ProviderUI {
  return APP_UI[appId];
}

/** @deprecated 使用 getAppUI */
export function getProviderUI(provider: ChatAiProvider): ProviderUI {
  return PROVIDER_UI[provider];
}
