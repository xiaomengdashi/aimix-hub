import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";

export const selectedChatModel = { value: "claude-sonnet-4-6" };

export const chatTransport = new AssistantChatTransport({
  api: "/api/chat",
  body: () => ({ model: selectedChatModel.value }),
});
