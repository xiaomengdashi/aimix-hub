import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { DEFAULT_CHAT_MODEL_ID } from "@/lib/chat-models";

export const selectedChatModel = { value: DEFAULT_CHAT_MODEL_ID };

export const chatTransport = new AssistantChatTransport({
  api: "/api/chat",
  body: () => ({ model: selectedChatModel.value }),
});
