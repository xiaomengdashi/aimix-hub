import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import type { ModelUiScope } from "@/lib/chat/models";
import { getDefaultModelIdForScope } from "@/lib/chat/models";
import { DEFAULT_CHAT_AI_PROVIDER } from "@/lib/chat/provider";
import type { ChatModeId } from "@/lib/chat/modes";
import type { ComposerToolId } from "@/lib/chat/composer-tools";

export const selectedChatModel = {
  value: getDefaultModelIdForScope("claude"),
};
export const selectedChatUiProvider = {
  value: DEFAULT_CHAT_AI_PROVIDER as ModelUiScope,
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
