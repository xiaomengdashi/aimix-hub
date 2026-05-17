import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { DEFAULT_CHAT_MODEL_ID } from "@/lib/chat-models";
import type { ChatModeId } from "@/lib/chat-modes";

export const selectedChatModel = { value: DEFAULT_CHAT_MODEL_ID };
export const selectedChatMode = { value: null as ChatModeId | null };

export const chatTransport = new AssistantChatTransport({
  api: "/api/chat",
  body: () => ({
    model: selectedChatModel.value,
    mode: selectedChatMode.value,
  }),
});
