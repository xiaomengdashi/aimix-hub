"use client";

import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import {
  ArrowUpIcon,
  CheckIcon,
  ClipboardIcon,
  Pencil1Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Mic } from "lucide-react";
import type { FC } from "react";
import { cn } from "@/lib/utils";
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
import { ArtifactAssistantMarkdown } from "@/components/assistant-ui/artifacts/artifact-assistant-markdown";
import { MarkdownText } from "@/components/assistant-ui/message/markdown-text";
import { AssistantMessageActionBar } from "@/components/assistant-ui/providers/shared/assistant-message-action-bar";
import { userMessageActionBarRootClass } from "@/components/assistant-ui/providers/shared/message-action-bar-styles";
import { ProviderModelPicker } from "@/components/assistant-ui/providers/shared/model-picker";
import { VoicePlaceholderButton } from "@/components/assistant-ui/providers/shared/voice-ui-placeholder";

const messageActionButtonClassName =
  "flex size-8 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]";

const claudeEditActionClassName =
  "rounded-md px-3 py-1.5 text-sm transition-colors";

export const ClaudeThread: FC = () => {
  const { onComposerSubmit } = useChatSession();

  return (
    <ThreadPrimitive.Root className="flex h-full flex-col items-stretch bg-[#F0ECE0] text-[#1a1a18] dark:bg-[#2b2a27] dark:text-[#eee]">
      <AuiIf condition={(s) => s.thread.isEmpty}>
        <EmptyState onSend={onComposerSubmit} />
      </AuiIf>

      <AuiIf condition={(s) => !s.thread.isEmpty}>
        <ThreadPrimitive.Viewport className="flex grow flex-col overflow-x-hidden overflow-y-auto px-4 pt-12 scroll-pb-52">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: ClaudeUserMessage,
              AssistantMessage: ClaudeAssistantMessage,
              EditComposer: ClaudeEditComposer,
            }}
          />

          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto w-full max-w-3xl bg-linear-to-b from-transparent via-[#F0ECE0]/85 to-[#F0ECE0] pt-4 pb-2 dark:via-[#2b2a27]/85 dark:to-[#2b2a27]">
            <Composer onSend={onComposerSubmit} />
            <ContextUsageIndicator
              variant="claude"
              className="mx-auto mt-2 w-full max-w-3xl justify-center sm:hidden"
            />
            <p className="pt-2 text-center text-[#8a8780] text-xs dark:text-[#a3a098]">
              Claude can make mistakes. Please double-check responses.
            </p>
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </AuiIf>
    </ThreadPrimitive.Root>
  );
};

const EmptyState: FC<{ onSend?: () => void }> = ({ onSend }) => {
  return (
    <div className="flex grow flex-col items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-stretch gap-5">
        <h1 className="text-center text-3xl text-[#1a1a18] sm:text-4xl dark:text-[#eee]">
          How can I help you today?
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
          <ClaudeComposerAttachments />
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
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
    {integrationNote ? (
      <p className="px-2 text-center text-[#8a8780] text-xs dark:text-[#a3a098]">
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
        condition={(s) =>
          !s.thread.isRunning && !s.composer.isEmpty && s.composer.canSend
        }
      >
        <ComposerPrimitive.Send className="flex size-8 items-center justify-center rounded-md bg-[#c96442] text-white transition-colors hover:bg-[#b1573a] disabled:pointer-events-none disabled:opacity-50">
          <ArrowUpIcon width={16} height={16} />
        </ComposerPrimitive.Send>
      </AuiIf>

      <AuiIf condition={(s) => !s.thread.isRunning && s.composer.isEmpty}>
        <VoicePlaceholderButton
          className="flex size-8 items-center justify-center rounded-md text-[#5b5950] dark:text-[#a3a098]"
          aria-label="语音输入"
        >
          <Mic className="size-4" />
        </VoicePlaceholderButton>
      </AuiIf>
    </>
  );
};

const ClaudeUserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="group/message relative mx-auto flex w-full max-w-3xl flex-col py-2"
      data-role="user"
    >
      <div className="flex max-w-[80%] flex-col items-end gap-1.5 ms-auto">
        <UserMessageAttachments />
        <div className="wrap-break-word w-full whitespace-pre-wrap rounded-2xl bg-[#E5E0D6] px-4 py-2.5 text-[#1a1a18] empty:hidden dark:bg-[#393937] dark:text-[#eee]">
          <MessagePrimitive.Parts>
            {({ part }) => {
              if (part.type === "text") return <MarkdownText />;
              return null;
            }}
          </MessagePrimitive.Parts>
        </div>
        <ActionBarPrimitive.Root
          hideWhenRunning
          className={cn("-mt-px", userMessageActionBarRootClass)}
        >
          <ActionBarPrimitive.Edit className={messageActionButtonClassName}>
            <Pencil1Icon width={16} height={16} />
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
    </MessagePrimitive.Root>
  );
};

const ClaudeAssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="group/message relative mx-auto flex w-full max-w-3xl flex-col py-2"
      data-role="assistant"
    >
      <div className="flex flex-col">
        <div className="prose prose-claude wrap-break-word text-[#1a1a18] leading-[1.65rem] dark:text-[#eee]">
          <MessagePrimitive.Parts>
            {({ part }) => {
              if (part.type === "text") return <ArtifactAssistantMarkdown />;
              return null;
            }}
          </MessagePrimitive.Parts>
        </div>
        <AssistantMessageActionBar variant="claude" className="mt-2" />
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
      <div className="flex max-w-[80%] flex-col items-end gap-2 ms-auto w-full">
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
                取消
              </button>
            </ComposerPrimitive.Cancel>
            <ComposerPrimitive.Send asChild>
              <button
                type="button"
                className={`${claudeEditActionClassName} bg-[#c96442] text-white hover:bg-[#b1573a]`}
              >
                更新并发送
              </button>
            </ComposerPrimitive.Send>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </MessagePrimitive.Root>
  );
};
