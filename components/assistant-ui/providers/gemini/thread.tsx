"use client";

import {
  ActionBarPrimitive,
  AttachmentPrimitive,
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  EllipsisVertical,
  Mic,
  Paperclip,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  ThumbsDown,
  ThumbsUp,
  XIcon,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { MarkdownText } from "@/components/assistant-ui/message/markdown-text";
import { useComposerTool } from "@/components/assistant-ui/contexts/composer-tool-context";
import { GEMINI_TOOLS_MENU } from "@/components/assistant-ui/providers/shared/composer-tools-menu-items";
import { ProviderAssistantParts } from "@/components/assistant-ui/providers/shared/provider-assistant-parts";
import { AssistantMessageError } from "@/components/assistant-ui/providers/shared/assistant-message-error";
import { ProviderModelPicker } from "@/components/assistant-ui/providers/shared/model-picker";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import { ThreadQuestionAnchor } from "@/components/assistant-ui/shell/thread-question-anchor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import { cn } from "@/lib/utils";

export const GeminiThread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col overflow-hidden bg-[#fdfcfc] text-[#1f1f1f] dark:bg-[#0c0c0c] dark:text-[#e3e3e3]">
      <AuiIf condition={(s) => s.thread.messages.length === 0}>
        <div className="relative flex grow flex-col">
          <div className="flex grow flex-col items-center justify-center px-4">
            <div className="flex w-full max-w-3xl flex-col">
              <h1 className="fade-in slide-in-from-bottom-3 relative z-10 mb-6 text-center text-4xl font-normal text-[#1f1f1f] delay-500 duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:animate-in fill-mode-both dark:text-white">
                How can I help you today?
              </h1>
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="fade-in zoom-in-40 pointer-events-none absolute top-1/2 left-1/2 h-[260px] w-[680px] max-w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-[140px] bg-[#a9d1fb]/60 blur-[90px] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:animate-in fill-mode-both dark:bg-[#1b2f9c]/50"
                />
                <div className="relative z-10">
                  <Composer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuiIf>

      <AuiIf condition={(s) => s.thread.messages.length > 0}>
        <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col overflow-y-scroll pt-12">
          <ThreadPrimitive.Messages
            components={{ Message: ChatMessage, EditComposer: GeminiEditComposer }}
          />
        </ThreadPrimitive.Viewport>
        <div className="flex w-full shrink-0 flex-col items-center gap-1.5 bg-[#fdfcfc] px-4 pb-3 dark:bg-[#0c0c0c]">
          <Composer />
          <ContextUsageIndicator
            variant="shadcn"
            className="justify-center text-[#5e6063] md:hidden dark:text-[#9aa0a6]"
          />
          <p className="text-center text-xs text-[#5e6063] dark:text-[#9aa0a6]">
            Gemini can make mistakes, so double-check it.
          </p>
        </div>
      </AuiIf>
    </ThreadPrimitive.Root>
  );
};

const ghostBtnClass =
  "flex shrink-0 items-center justify-center rounded-full text-[#444746] transition-colors hover:bg-[#444746]/8 hover:text-[#1f1f1f] dark:text-[#c4c7c5] dark:hover:bg-[#c4c7c5]/10 dark:hover:text-[#e3e3e3]";

const Composer: FC = () => {
  const { composerPlaceholder, integrationNote } = useComposerTool();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-1">
      <ComposerPrimitive.Root className="flex w-full flex-col rounded-4xl bg-white p-3 dark:bg-[#1e1f20]">
        <AuiIf condition={(s) => s.composer.attachments.length > 0}>
          <div className="flex flex-row gap-2.5 overflow-x-auto px-1 pt-1 pb-2.5">
            <ComposerPrimitive.Attachments
              components={{ Attachment: GeminiAttachment }}
            />
          </div>
        </AuiIf>

        <div className="flex items-end gap-1">
          <GeminiPlusMenu />
          <ComposerPrimitive.Input
            rows={1}
            placeholder={composerPlaceholder ?? "Ask Gemini"}
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-[17px] leading-6 text-[#1f1f1f] outline-none placeholder:text-[#575b5f] dark:text-[#e3e3e3] dark:placeholder:text-[#9aa0a6]"
          />
          <ProviderModelPicker
            variant="gemini"
            className="h-9 shrink-0 gap-0.5 rounded-full pr-1.5 pl-3 text-sm whitespace-nowrap text-[#444746] transition-colors hover:bg-[#444746]/8 hover:text-[#1f1f1f] dark:text-[#c4c7c5] dark:hover:bg-[#c4c7c5]/10 dark:hover:text-[#e3e3e3]"
          />
          <ComposerPrimitive.Dictate
            aria-label="Voice mode"
            className={`${ghostBtnClass} size-9`}
          >
            <Mic width={20} height={20} />
          </ComposerPrimitive.Dictate>
          <GeminiSendButton />
        </div>
      </ComposerPrimitive.Root>
      {integrationNote ? (
        <p className="px-2 text-center text-xs text-[#5e6063] dark:text-[#9aa0a6]">
          {integrationNote}
        </p>
      ) : null}
    </div>
  );
};

const GeminiPlusMenu: FC = () => {
  const { toggleTool, tool } = useComposerTool();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Add files and tools"
        className={`${ghostBtnClass} size-9`}
      >
        <PlusIcon width={20} height={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="min-w-56">
        <DropdownMenuItem asChild>
          <ComposerPrimitive.AddAttachment className="flex w-full cursor-pointer items-center gap-2.5">
            <Paperclip className="size-4" />
            Add photos & files
          </ComposerPrimitive.AddAttachment>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {GEMINI_TOOLS_MENU.map(({ id, label, Icon }) => (
          <DropdownMenuItem
            key={id}
            onSelect={(event) => {
              event.preventDefault();
              toggleTool(id);
            }}
            className={cn(tool === id && "bg-accent/60")}
            icon={<Icon className="size-4" />}
          >
            <span className="flex flex-1 items-center justify-between gap-2">
              <span>{label}</span>
              {tool === id ? <CheckIcon className="size-4 shrink-0 opacity-70" /> : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const sendBtnClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1f3b9b] text-white transition-colors hover:bg-[#274aad]";

const GeminiSendButton: FC = () => {
  return (
    <>
      <AuiIf condition={(s) => !s.thread.isRunning && !s.composer.isEmpty}>
        <ComposerPrimitive.Send
          aria-label="Send message"
          className={`${sendBtnClass} disabled:bg-[#e8eaed] disabled:text-[#1f1f1f]/40 dark:disabled:bg-[#2b2c2e] dark:disabled:text-white/30`}
        >
          <ArrowUpIcon width={20} height={20} />
        </ComposerPrimitive.Send>
      </AuiIf>
      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel aria-label="Stop generating" className={sendBtnClass}>
          <span className="size-3 rounded-[3px] bg-current" />
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </>
  );
};

const actionBtnClass =
  "flex size-8 items-center justify-center rounded-full text-[#444746] transition-colors hover:bg-[#444746]/8 hover:text-[#1f1f1f] dark:text-[#c4c7c5] dark:hover:bg-[#c4c7c5]/10 dark:hover:text-[#e3e3e3]";

const ChatMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="group/message mx-auto mb-7 flex w-full max-w-3xl flex-col px-4">
      <AuiIf condition={(s) => s.message.role === "user"}>
        <ThreadQuestionAnchor className="w-full">
          <div className="flex items-center justify-end gap-1">
            <ActionBarPrimitive.Root className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
              <ActionBarPrimitive.Copy className={actionBtnClass}>
                <CopyIcon width={16} height={16} />
              </ActionBarPrimitive.Copy>
              <ActionBarPrimitive.Edit className={actionBtnClass}>
                <PencilIcon width={16} height={16} />
              </ActionBarPrimitive.Edit>
            </ActionBarPrimitive.Root>
            <div className="max-w-[75%] wrap-break-word rounded-3xl bg-[#f2f0f0] px-5 py-3 text-[#1f1f1f] dark:bg-[#333537] dark:text-[#e3e3e3]">
              <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
            </div>
          </div>
        </ThreadQuestionAnchor>
      </AuiIf>

      <AuiIf condition={(s) => s.message.role === "assistant"}>
        <div className="flex flex-col">
          <div className="wrap-break-word text-[#1f1f1f] dark:text-[#e3e3e3]">
            <ProviderAssistantParts />
          </div>
          <AssistantMessageError />
          <ActionBarPrimitive.Root className="mt-1.5 -ml-2 flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
            <ActionBarPrimitive.FeedbackPositive className={actionBtnClass}>
              <AuiIf
                condition={(s) =>
                  s.message.metadata.submittedFeedback?.type === "positive"
                }
              >
                <ThumbsUp width={16} height={16} className="fill-current" />
              </AuiIf>
              <AuiIf
                condition={(s) =>
                  s.message.metadata.submittedFeedback?.type !== "positive"
                }
              >
                <ThumbsUp width={16} height={16} />
              </AuiIf>
            </ActionBarPrimitive.FeedbackPositive>
            <ActionBarPrimitive.FeedbackNegative className={actionBtnClass}>
              <AuiIf
                condition={(s) =>
                  s.message.metadata.submittedFeedback?.type === "negative"
                }
              >
                <ThumbsDown width={16} height={16} className="fill-current" />
              </AuiIf>
              <AuiIf
                condition={(s) =>
                  s.message.metadata.submittedFeedback?.type !== "negative"
                }
              >
                <ThumbsDown width={16} height={16} />
              </AuiIf>
            </ActionBarPrimitive.FeedbackNegative>
            <ActionBarPrimitive.Copy className={actionBtnClass}>
              <AuiIf condition={(s) => s.message.isCopied}>
                <CheckIcon width={16} height={16} />
              </AuiIf>
              <AuiIf condition={(s) => !s.message.isCopied}>
                <CopyIcon width={16} height={16} />
              </AuiIf>
            </ActionBarPrimitive.Copy>
            <ActionBarPrimitive.Reload className={actionBtnClass}>
              <RefreshCwIcon width={16} height={16} />
            </ActionBarPrimitive.Reload>
            <button type="button" aria-label="More" className={actionBtnClass}>
              <EllipsisVertical width={16} height={16} />
            </button>
          </ActionBarPrimitive.Root>
        </div>
      </AuiIf>
    </MessagePrimitive.Root>
  );
};

const GeminiEditComposer: FC = () => (
  <MessagePrimitive.Root className="mx-auto mb-7 flex w-full max-w-3xl flex-col px-4">
    <ComposerPrimitive.Root className="ms-auto w-full max-w-[75%] rounded-3xl bg-[#f2f0f0] px-4 py-3 dark:bg-[#333537]">
      <ComposerPrimitive.Input
        className="min-h-14 w-full resize-none bg-transparent text-[#1f1f1f] outline-none dark:text-[#e3e3e3]"
        autoFocus
      />
      <div className="mt-2 flex justify-end gap-2">
        <ComposerPrimitive.Cancel className="rounded-full px-3 py-1.5 text-sm text-[#444746] hover:bg-[#444746]/8">
          Cancel
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send className="rounded-full bg-[#1f3b9b] px-3 py-1.5 text-sm text-white hover:bg-[#274aad]">
          Send
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  </MessagePrimitive.Root>
);

const useFileSrc = (file: File | undefined) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setSrc(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return src;
};

const useAttachmentSrc = () => {
  const { file, src } = useAuiState(
    useShallow(({ attachment }): { file?: File; src?: string } => {
      if (attachment.type !== "image") return {};
      if (attachment.file) return { file: attachment.file };
      const src = attachment.content?.filter((c) => c.type === "image")[0]
        ?.image;
      if (!src) return {};
      return { src };
    }),
  );

  return useFileSrc(file) ?? src;
};

const GeminiAttachment: FC = () => {
  const isImage = useAuiState(({ attachment }) => attachment.type === "image");
  const src = useAttachmentSrc();

  return (
    <AttachmentPrimitive.Root className="group/thumbnail relative">
      <div className="size-[72px] overflow-hidden rounded-xl border border-[#dadce0] bg-[#f1f3f4] dark:border-[#3c4043] dark:bg-[#282a2c]">
        {isImage && src ? (
          // biome-ignore lint/performance/noImgElement: example component
          <img className="size-full object-cover" alt="Attachment" src={src} />
        ) : (
          <div className="flex size-full items-center justify-center text-[#5e6063] dark:text-[#9aa0a6]">
            <AttachmentPrimitive.unstable_Thumb className="text-xs" />
          </div>
        )}
      </div>
      <AttachmentPrimitive.Remove
        className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border border-[#dadce0] bg-white text-[#5e6063] opacity-0 transition-all group-focus-within/thumbnail:opacity-100 group-hover/thumbnail:opacity-100 hover:bg-[#f1f3f4] hover:text-[#1f1f1f] dark:border-[#3c4043] dark:bg-[#1e1f20] dark:text-[#9aa0a6] dark:hover:bg-[#2b2c2f] dark:hover:text-[#e3e3e3]"
        aria-label="Remove attachment"
      >
        <XIcon width={14} height={14} />
      </AttachmentPrimitive.Remove>
    </AttachmentPrimitive.Root>
  );
};
