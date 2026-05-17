import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import {
  DEFAULT_CHAT_AI_PROVIDER,
  type ChatAiProvider,
} from "@/lib/chat/provider";
import { getDefaultModelIdForProvider } from "@/lib/chat/models";
import type { ChatModeId } from "@/lib/chat/modes";
import type { ComposerToolId } from "@/lib/chat/composer-tools";

export const selectedChatModel = {
  value: getDefaultModelIdForProvider("claude"),
};
export const selectedChatUiProvider = {
  value: DEFAULT_CHAT_AI_PROVIDER as ChatAiProvider,
};
export const selectedChatMode = { value: null as ChatModeId | null };
export const selectedComposerTool = { value: null as ComposerToolId | null };

export const chatTransport = new AssistantChatTransport({
  api: "/api/chat",
  body: () => ({
    model: selectedChatModel.value,
    uiProvider: selectedChatUiProvider.value,
    mode: selectedChatMode.value,
    tool: selectedComposerTool.value,
  }),
});
