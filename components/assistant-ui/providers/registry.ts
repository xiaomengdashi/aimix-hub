import type { FC, ReactNode } from "react";
import type { ChatAiProvider } from "@/lib/chat-ai-provider";
import { ClaudeLayout, ClaudeThread } from "@/components/assistant-ui/providers/claude";
import { ChatGPTLayout, ChatGPTThread } from "@/components/assistant-ui/providers/chatgpt";
import { GeminiLayout, GeminiThread } from "@/components/assistant-ui/providers/gemini";
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

export function getProviderUI(provider: ChatAiProvider): ProviderUI {
  return PROVIDER_UI[provider];
}
