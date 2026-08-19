"use client";

import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import { ArrowUpIcon, CheckIcon, ClipboardIcon } from "@radix-ui/react-icons";
import {
  AudioLines,
  PencilIcon,
  RefreshCwIcon,
  Sparkle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { FC } from "react";
import {
  ClaudeComposerAddAttachment,
  ClaudeComposerAttachments,
} from "@/components/assistant-ui/providers/claude/composer-attachment";
import { useChatMode } from "@/components/assistant-ui/contexts/chat-mode-context";
import { useComposerTool } from "@/components/assistant-ui/contexts/composer-tool-context";
import { useChatSession } from "@/components/assistant-ui/contexts/chat-session-context";
import { ComposerToolsMenu } from "@/components/assistant-ui/providers/shared/composer-tools-menu";
import { CLAUDE_TOOLS_MENU } from "@/components/assistant-ui/providers/shared/composer-tools-menu-items";
import { UserMessageAttachments } from "@/components/assistant-ui/message/attachment";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import { ModeTabs } from "@/components/assistant-ui/shell/mode-tabs";
import { MarkdownText } from "@/components/assistant-ui/message/markdown-text";
import { ProviderAssistantParts } from "@/components/assistant-ui/providers/shared/provider-assistant-parts";
import { AssistantMessageError } from "@/components/assistant-ui/providers/shared/assistant-message-error";
import { ProviderModelPicker } from "@/components/assistant-ui/providers/shared/model-picker";
import { ThreadUserMessageRoot } from "@/components/assistant-ui/shell/thread-user-message-root";

const messageActionButtonClassName =
  "flex size-8 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]";

const claudeEditActionClassName =
  "rounded-md px-3 py-1.5 text-sm transition-colors";

export const ClaudeThread: FC = () => {
  const { onComposerSubmit } = useChatSession();

  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col items-stretch overflow-hidden bg-[#F0ECE0] font-serif text-[#1a1a18] dark:bg-[#2b2a27] dark:text-[#eee]">
      <AuiIf condition={(s) => s.thread.isEmpty}>
        <EmptyState onSend={onComposerSubmit} />
      </AuiIf>

      <AuiIf condition={(s) => !s.thread.isEmpty}>
        <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 pt-12">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: ClaudeUserMessage,
              AssistantMessage: ClaudeAssistantMessage,
              EditComposer: ClaudeEditComposer,
            }}
          />
        </ThreadPrimitive.Viewport>
        <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-2">
          <Composer onSend={onComposerSubmit} />
          <ContextUsageIndicator
            variant="claude"
            className="mx-auto mt-2 w-full max-w-3xl justify-center sm:hidden"
          />
          <p className="pt-2 text-center text-xs text-[#8a8780] dark:text-[#a3a098]">
            Claude can make mistakes. Please double-check responses.
          </p>
        </div>
      </AuiIf>
    </ThreadPrimitive.Root>
  );
};

const EmptyState: FC<{ onSend?: () => void }> = ({ onSend }) => {
  return (
    <div className="flex grow flex-col items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-stretch gap-5">
        <h1 className="flex items-center justify-center gap-3 font-serif text-3xl text-[#1a1a18] sm:text-4xl dark:text-[#eee]">
          <Sparkle className="size-7 fill-[#c96442] text-[#c96442]" />
          <span>How can I help you today?</span>
        </h1>
        <Composer onSend={onSend} />
        <ContextUsageIndicator
          variant="claude"
          className="justify-center sm:hidden"
        />
        <ModeTabs />
      </div>
    </div>
  );
};

const Composer: FC<{ onSend?: () => void }> = ({ onSend }) => {
  const { activeMode } = useChatMode();
  const { onAttachmentError } = useChatSession();
  const { tool, composerPlaceholder, integrationNote } = useComposerTool();
  const placeholder = tool
    ? composerPlaceholder
    : (activeMode?.composerPlaceholder ??
      composerPlaceholder ??
      "How can I help you today?");

  return (
    <div className="flex w-full flex-col gap-1">
      <ComposerPrimitive.Root
        className="flex w-full flex-col gap-2 rounded-2xl border border-[#E5E0D6] bg-white px-3.5 pt-3 pb-2.5 dark:border-[#3d3a35] dark:bg-[#1f1e1b]"
        onSubmit={onSend}
      >
        <ComposerPrimitive.AttachmentDropzone asChild>
          <div className="flex w-full flex-col gap-2">
            <ComposerPrimitive.Input
              placeholder={placeholder}
              rows={1}
              className="block max-h-72 min-h-6 w-full resize-none bg-transparent text-[#1a1a18] outline-none placeholder:text-[#9a9893] dark:text-[#eee] dark:placeholder:text-[#9a9893]"
            />

            <div className="flex w-full items-center gap-2">
              <ClaudeComposerAddAttachment
                onError={onAttachmentError}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]"
              />
              <ComposerToolsMenu
                variant="claude"
                tools={CLAUDE_TOOLS_MENU}
                align="start"
              />
              <ContextUsageIndicator
                variant="claude"
                className="hidden min-w-0 flex-1 sm:flex"
              />

              <div className="ml-auto flex items-center gap-1">
                <ProviderModelPicker variant="claude" />
                <ComposerPrimaryAction />
              </div>
            </div>

            <ClaudeComposerAttachments />
          </div>
        </ComposerPrimitive.AttachmentDropzone>
      </ComposerPrimitive.Root>
      {integrationNote ? (
        <p className="px-2 text-center text-xs text-[#8a8780] dark:text-[#a3a098]">
          {integrationNote}
        </p>
      ) : null}
    </div>
  );
};

const ComposerPrimaryAction: FC = () => {
  return (
    <>
      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel className="flex size-8 items-center justify-center rounded-md bg-[#c96442] text-white transition-colors hover:bg-[#b1573a]">
          <div className="size-2.5 rounded-[2px] bg-current" />
        </ComposerPrimitive.Cancel>
      </AuiIf>

      <AuiIf
        condition={(s) => !s.thread.isRunning && s.composer.dictation != null}
      >
        <ComposerPrimitive.StopDictation
          className="flex size-8 items-center justify-center rounded-md bg-[#c96442] text-white transition-colors hover:bg-[#b1573a]"
          aria-label="Stop dictation"
        >
          <div className="size-2.5 animate-pulse rounded-[2px] bg-current" />
        </ComposerPrimitive.StopDictation>
      </AuiIf>

      <AuiIf
        condition={(s) =>
          !s.thread.isRunning &&
          s.composer.dictation == null &&
          !s.composer.isEmpty
        }
      >
        <ComposerPrimitive.Send className="flex size-8 items-center justify-center rounded-md bg-[#c96442] text-white transition-colors hover:bg-[#b1573a] disabled:pointer-events-none disabled:opacity-50">
          <ArrowUpIcon width={16} height={16} />
        </ComposerPrimitive.Send>
      </AuiIf>

      <AuiIf
        condition={(s) =>
          !s.thread.isRunning &&
          s.composer.dictation == null &&
          s.composer.isEmpty
        }
      >
        <ComposerPrimitive.Dictate
          className="flex size-8 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]"
          aria-label="Use voice mode"
        >
          <AudioLines className="size-4" />
        </ComposerPrimitive.Dictate>
      </AuiIf>
    </>
  );
};

const ClaudeUserMessage: FC = () => {
  return (
    <ThreadUserMessageRoot className="group/message relative mx-auto flex w-full max-w-3xl flex-col py-2">
      <div className="ms-auto flex max-w-[80%] flex-col items-end gap-1">
        <UserMessageAttachments />
        <div className="w-full wrap-break-word whitespace-pre-wrap rounded-2xl bg-[#E5E0D6] px-4 py-2.5 text-[#1a1a18] empty:hidden dark:bg-[#393937] dark:text-[#eee]">
          <MessagePrimitive.Parts>
            {({ part }) => {
              if (part.type === "text") return <MarkdownText />;
              return null;
            }}
          </MessagePrimitive.Parts>
        </div>
        <ActionBarPrimitive.Root className="-mt-px flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
          <ActionBarPrimitive.Edit className={messageActionButtonClassName}>
            <PencilIcon width={16} height={16} />
          </ActionBarPrimitive.Edit>
          <ActionBarPrimitive.Copy className={messageActionButtonClassName}>
            <AuiIf condition={(s) => s.message.isCopied}>
              <CheckIcon />
            </AuiIf>
            <AuiIf condition={(s) => !s.message.isCopied}>
              <ClipboardIcon width={16} height={16} />
            </AuiIf>
          </ActionBarPrimitive.Copy>
        </ActionBarPrimitive.Root>
      </div>
    </ThreadUserMessageRoot>
  );
};

const ClaudeAssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="group/message relative mx-auto flex w-full max-w-3xl flex-col py-2"
      data-role="assistant"
    >
      <div className="flex flex-col">
        <div className="prose prose-claude wrap-break-word font-serif leading-[1.65rem] text-[#1a1a18] dark:text-[#eee]">
          <ProviderAssistantParts />
        </div>
        <AssistantMessageError />
        <ActionBarPrimitive.Root className="mt-2 flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
          <ActionBarPrimitive.Copy className={messageActionButtonClassName}>
            <AuiIf condition={(s) => s.message.isCopied}>
              <CheckIcon />
            </AuiIf>
            <AuiIf condition={(s) => !s.message.isCopied}>
              <ClipboardIcon width={16} height={16} />
            </AuiIf>
          </ActionBarPrimitive.Copy>
          <ActionBarPrimitive.FeedbackPositive
            className={messageActionButtonClassName}
          >
            <AuiIf
              condition={(s) =>
                s.message.metadata.submittedFeedback?.type === "positive"
              }
            >
              <ThumbsUp className="size-4 fill-current" />
            </AuiIf>
            <AuiIf
              condition={(s) =>
                s.message.metadata.submittedFeedback?.type !== "positive"
              }
            >
              <ThumbsUp className="size-4" />
            </AuiIf>
          </ActionBarPrimitive.FeedbackPositive>
          <ActionBarPrimitive.FeedbackNegative
            className={messageActionButtonClassName}
          >
            <AuiIf
              condition={(s) =>
                s.message.metadata.submittedFeedback?.type === "negative"
              }
            >
              <ThumbsDown className="size-4 fill-current" />
            </AuiIf>
            <AuiIf
              condition={(s) =>
                s.message.metadata.submittedFeedback?.type !== "negative"
              }
            >
              <ThumbsDown className="size-4" />
            </AuiIf>
          </ActionBarPrimitive.FeedbackNegative>
          <ActionBarPrimitive.Reload className={messageActionButtonClassName}>
            <RefreshCwIcon width={16} height={16} />
          </ActionBarPrimitive.Reload>
        </ActionBarPrimitive.Root>
      </div>
    </MessagePrimitive.Root>
  );
};

const ClaudeEditComposer: FC = () => {
  return (
    <MessagePrimitive.Root
      className="relative mx-auto flex w-full max-w-3xl flex-col py-2"
      data-role="user"
    >
      <div className="ms-auto flex w-full max-w-[80%] flex-col items-end gap-2">
        <ComposerPrimitive.Root className="flex w-full flex-col gap-2 rounded-2xl border border-[#E5E0D6] bg-white px-3.5 pt-3 pb-2.5 dark:border-[#3d3a35] dark:bg-[#1f1e1b]">
          <ComposerPrimitive.Input
            className="block min-h-14 w-full resize-none bg-transparent text-[#1a1a18] outline-none dark:text-[#eee]"
            autoFocus
            aria-label="编辑消息"
          />
          <div className="flex items-center justify-end gap-2">
            <ComposerPrimitive.Cancel asChild>
              <button
                type="button"
                className={`${claudeEditActionClassName} text-[#5b5950] hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]`}
              >
                Cancel
              </button>
            </ComposerPrimitive.Cancel>
            <ComposerPrimitive.Send asChild>
              <button
                type="button"
                className={`${claudeEditActionClassName} bg-[#c96442] text-white hover:bg-[#b1573a]`}
              >
                Send
              </button>
            </ComposerPrimitive.Send>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </MessagePrimitive.Root>
  );
};
