import type { FeedbackAdapter } from "@assistant-ui/core";

export type MessageFeedbackType = "positive" | "negative";

export function isMessageFeedbackType(
  value: unknown,
): value is MessageFeedbackType {
  return value === "positive" || value === "negative";
}

export function createChatFeedbackAdapter(
  getRemoteThreadId: () => string | undefined,
): FeedbackAdapter {
  return {
    submit: ({ message, type }) => {
      const threadId = getRemoteThreadId();
      if (!threadId || !message.id) return;

      void fetch("/api/messages/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          messageId: message.id,
          type,
        }),
      }).catch(() => {
        // Runtime already marks the in-memory thumbs state; persist is best-effort.
      });
    },
  };
}
