"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import type { AssistantRuntime, RemoteThreadListAdapter } from "@assistant-ui/core";
import { useRemoteThreadListRuntime } from "@assistant-ui/react";
import { useAui, useAuiState } from "@assistant-ui/store";
import {
  useAISDKRuntime,
  type UseChatRuntimeOptions,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import type { ChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { chatAttachmentAdapter } from "@/lib/chat/attachment-adapter";

export type UseStableChatRuntimeOptions<
  UI_MESSAGE extends UIMessage = UIMessage,
> = UseChatRuntimeOptions<UI_MESSAGE> & {
  threadListAdapter: RemoteThreadListAdapter;
  /** @deprecated Prefer `threadId`, which reacts to URL changes. */
  initialThreadId?: string | undefined;
  threadId?: string | undefined;
};

const useDynamicChatTransport = <UI_MESSAGE extends UIMessage = UIMessage>(
  transport: ChatTransport<UI_MESSAGE>,
): ChatTransport<UI_MESSAGE> => {
  const transportRef = useRef(transport);
  useEffect(() => {
    transportRef.current = transport;
  });
  return useMemo(
    () =>
      new Proxy(transportRef.current, {
        get(_, prop) {
          const res =
            transportRef.current[prop as keyof ChatTransport<UI_MESSAGE>];
          return typeof res === "function"
            ? res.bind(transportRef.current)
            : res;
        },
      }),
    [],
  );
};

const useChatThreadRuntime = <UI_MESSAGE extends UIMessage = UIMessage>(
  options?: UseChatRuntimeOptions<UI_MESSAGE>,
): AssistantRuntime => {
  const {
    adapters,
    transport: transportOptions,
    toCreateMessage,
    onResume,
    suggestions,
    ...chatOptions
  } = options ?? {};

  const transport = useDynamicChatTransport(
    transportOptions ?? new AssistantChatTransport(),
  );

  const id = useAuiState((s) => s.threadListItem.id);
  const aui = useAui();
  const chat = useChat({
    ...chatOptions,
    id,
    transport,
  });

  const runtime = useAISDKRuntime(chat, {
    adapters: {
      attachments: chatAttachmentAdapter,
      ...adapters,
    },
    ...(toCreateMessage && { toCreateMessage }),
    ...(onResume && { onResume }),
    ...(suggestions && { suggestions }),
  });

  if (transport instanceof AssistantChatTransport) {
    transport.setRuntime(runtime);
    transport.__internal_setGetThreadListItem(() =>
      aui.threadListItem.source ? aui.threadListItem : undefined,
    );
  }

  return runtime;
};

export const useStableChatRuntime = <UI_MESSAGE extends UIMessage = UIMessage>(
  options: UseStableChatRuntimeOptions<UI_MESSAGE>,
): AssistantRuntime => {
  const { threadListAdapter, ...chatOptions } = options;
  const optionsRef = useRef(chatOptions);
  optionsRef.current = chatOptions;

  const runtimeHook = useCallback(() => {
    return useChatThreadRuntime(optionsRef.current);
  }, []);

  return useRemoteThreadListRuntime({
    runtimeHook,
    adapter: threadListAdapter,
    allowNesting: true,
  });
};
