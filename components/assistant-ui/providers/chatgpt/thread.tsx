"use client";

import { cn } from "@/lib/utils";
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  AttachmentPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import { useEffect, useState, type FC } from "react";
import { AssistantFilePart } from "@/components/assistant-ui/message/assistant-file-part";
import { ArtifactAssistantMarkdown } from "@/components/assistant-ui/artifacts/artifact-assistant-markdown";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { ToolFallback } from "@/components/assistant-ui/message/tool-fallback";
import { AssistantMessageError } from "@/components/assistant-ui/providers/shared/assistant-message-error";
import { useShallow } from "zustand/shallow";
import {
  ArrowUpIcon,
  AudioLines,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  Download,
  Mic,
  MoreHorizontal,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Share,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  XIcon,
} from "lucide-react";
import { useComposerTool } from "@/components/assistant-ui/contexts/composer-tool-context";
import { ComposerToolsMenu } from "@/components/assistant-ui/providers/shared/composer-tools-menu";
import { CHATGPT_TOOLS_MENU } from "@/components/assistant-ui/providers/shared/composer-tools-menu-items";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import { ThreadUserMessageRoot } from "@/components/assistant-ui/shell/thread-user-message-root";

export const ChatGPTThread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col items-stretch overflow-hidden bg-white px-4 text-[#0d0d0d] dark:bg-black dark:text-[#ececec]">
      <AuiIf condition={(s) => s.thread.isEmpty}>
        <EmptyState />
      </AuiIf>

      <AuiIf condition={(s) => !s.thread.isEmpty}>
        <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-scroll pt-16">
          <ThreadPrimitive.Messages>
            {({ message }) => {
              if (message.composer.isEditing) return <EditComposer />;
              if (message.role === "user") return <UserMessage />;
              return <AssistantMessage />;
            }}
          </ThreadPrimitive.Messages>

          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto flex justify-center overflow-visible bg-white pb-2 dark:bg-black">
            <ThreadScrollToBottom />
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
        <div className="mx-auto w-full max-w-3xl shrink-0 pb-2">
          <Composer placeholder="Ask anything" />
          <ContextUsageIndicator
            variant="shadcn"
            className="justify-center text-[#5d5d5d] md:hidden dark:text-[#afafaf]"
          />
          <p className="text-center text-xs text-[#5d5d5d] dark:text-[#afafaf]">
            ChatGPT can make mistakes. Check important info.
          </p>
        </div>
      </AuiIf>
    </ThreadPrimitive.Root>
  );
};

const EmptyState: FC = () => {
  return (
    <div className="flex grow flex-col items-center justify-center px-4 pb-[16vh]">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-6">
        <h1 className="text-center text-2xl leading-7 font-normal text-[#0d0d0d] dark:text-[#ececec]">
          Where should we begin?
        </h1>
        <Composer placeholder="Ask anything" />
        <ContextUsageIndicator
          variant="shadcn"
          className="justify-center text-[#5d5d5d] md:hidden dark:text-[#afafaf]"
        />
      </div>
    </div>
  );
};

const Composer: FC<{ placeholder?: string }> = ({
  placeholder: placeholderProp,
}) => {
  const { composerPlaceholder, integrationNote } = useComposerTool();
  const placeholder = placeholderProp ?? composerPlaceholder;

  return (
    <div className="flex w-full flex-col gap-1">
      <ComposerPrimitive.Root className="group/composer flex w-full flex-col rounded-[28px] border border-[#e5e5e5] bg-white px-2 py-2 focus-within:border-[#d0d0d0] dark:border-transparent dark:bg-[#212121] dark:focus-within:border-transparent">
        <AuiIf condition={(s) => s.composer.attachments.length > 0}>
          <div className="flex flex-row flex-wrap gap-2 px-1 pt-1 pb-2">
            <ComposerPrimitive.Attachments
              components={{ Attachment: ChatGPTAttachmentUI }}
            />
          </div>
        </AuiIf>

        <div className="flex items-end gap-1">
          <ComposerPrimitive.AddAttachment asChild>
            <TooltipIconButton
              type="button"
              tooltip="Add photos & files"
              side="top"
              aria-label="Add attachment"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5d5d5d] transition-colors hover:bg-black/[0.07] hover:text-[#5d5d5d] dark:text-[#cdcdcd] dark:hover:bg-white/15 dark:hover:text-[#cdcdcd]"
            >
              <PlusIcon size={20} />
            </TooltipIconButton>
          </ComposerPrimitive.AddAttachment>
          <ComposerToolsMenu
            variant="chatgpt"
            tools={CHATGPT_TOOLS_MENU}
            align="start"
          />

          <ComposerPrimitive.Input
            autoFocus
            placeholder={placeholder}
            rows={1}
            className="max-h-52 min-h-9 flex-1 resize-none bg-transparent py-1.5 pr-2 pl-1 text-base text-[#0d0d0d] outline-none placeholder:text-[#8e8e8e] dark:text-[#ececec] dark:placeholder:text-[#8e8e8e]"
          />

          <div className="flex shrink-0 items-center gap-1">
            <ComposerPrimaryAction />
          </div>
        </div>
      </ComposerPrimitive.Root>
      {integrationNote ? (
        <p className="px-3 text-center text-xs text-[#8e8e8e]">{integrationNote}</p>
      ) : null}
    </div>
  );
};

const ComposerPrimaryAction: FC = () => {
  return (
    <div className="flex items-center gap-1">
      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel className="flex size-9 items-center justify-center rounded-full bg-[#0d0d0d] text-white dark:bg-white dark:text-black">
          <div className="size-2.5 rounded-[2px] bg-current" />
        </ComposerPrimitive.Cancel>
      </AuiIf>

      <AuiIf
        condition={(s) => !s.thread.isRunning && s.composer.dictation != null}
      >
        <ComposerPrimitive.StopDictation
          className="flex size-9 items-center justify-center rounded-full bg-[#0d0d0d] text-white dark:bg-white dark:text-black"
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
        <ComposerPrimitive.Send className="flex size-9 items-center justify-center rounded-full bg-[#0d0d0d] text-white transition-opacity disabled:opacity-30 dark:bg-white dark:text-black">
          <ArrowUpIcon className="size-6" />
        </ComposerPrimitive.Send>
      </AuiIf>

      <AuiIf
        condition={(s) =>
          !s.thread.isRunning &&
          s.composer.dictation == null &&
          s.composer.isEmpty
        }
      >
        <ComposerPrimitive.Dictate asChild>
          <TooltipIconButton
            tooltip="Dictate"
            side="top"
            aria-label="Dictate"
            className="flex size-9 items-center justify-center rounded-full text-[#5d5d5d] transition-colors hover:bg-black/[0.07] hover:text-[#5d5d5d] dark:text-[#cdcdcd] dark:hover:bg-white/15 dark:hover:text-[#cdcdcd]"
          >
            <Mic className="size-5" />
          </TooltipIconButton>
        </ComposerPrimitive.Dictate>

        <TooltipIconButton
          type="button"
          tooltip="Use voice mode"
          side="top"
          aria-hidden="true"
          tabIndex={-1}
          className="flex size-9 items-center justify-center rounded-full bg-[#0d0d0d] text-white hover:bg-[#0d0d0d] dark:bg-white dark:text-black dark:hover:bg-white"
        >
          <AudioLines className="size-5" />
        </TooltipIconButton>
      </AuiIf>
    </div>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        className="absolute -top-10 z-10 self-center rounded-full border bg-background p-2 disabled:invisible dark:border-white/15 dark:bg-[#2a2a2a]"
      >
        <ChevronDownIcon className="size-5" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const UserMessage: FC = () => {
  return (
    <ThreadUserMessageRoot className="relative mx-auto flex w-full max-w-3xl flex-col items-end gap-1">
      <div className="flex flex-row flex-wrap justify-end gap-2">
        <MessagePrimitive.Attachments
          components={{ Attachment: ChatGPTAttachmentUI }}
        />
      </div>

      <div className="max-w-[70%] rounded-[22px] bg-[#0d0d0d] px-4 py-2.5 leading-6 wrap-break-word text-white dark:bg-[#ececec] dark:text-[#0d0d0d]">
        <MessagePrimitive.Parts />
      </div>

      <div className="flex items-center gap-0.5">
        <ActionBarPrimitive.Root
          hideWhenRunning
          autohide="always"
          autohideFloat="single-branch"
          className="flex items-center"
        >
          <ActionBarPrimitive.Copy asChild>
            <TooltipIconButton
              tooltip="Copy"
              side="top"
              className={assistantActionClassName}
            >
              <AuiIf condition={(s) => s.message.isCopied}>
                <CheckIcon className="size-5" />
              </AuiIf>
              <AuiIf condition={(s) => !s.message.isCopied}>
                <CopyIcon className="size-5" />
              </AuiIf>
            </TooltipIconButton>
          </ActionBarPrimitive.Copy>
          <ActionBarPrimitive.Edit asChild>
            <TooltipIconButton
              tooltip="Edit"
              side="top"
              className={assistantActionClassName}
            >
              <PencilIcon className="size-5" />
            </TooltipIconButton>
          </ActionBarPrimitive.Edit>
        </ActionBarPrimitive.Root>

        <BranchPicker />
      </div>
    </ThreadUserMessageRoot>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="mx-auto flex w-full max-w-3xl flex-col justify-end gap-1 rounded-3xl bg-[#e9e9e9]/50 dark:bg-[#323232]">
      <ComposerPrimitive.Input className="flex h-8 w-full resize-none bg-transparent p-5 pb-0 text-foreground outline-none dark:text-white" />

      <div className="m-3 mt-2 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel className="rounded-full bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
          Cancel
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
          Send
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const assistantActionClassName =
  "flex size-8 items-center justify-center rounded-lg text-[#5d5d5d] transition-colors hover:bg-black/[0.07] hover:text-[#5d5d5d] dark:text-[#cdcdcd] dark:hover:bg-white/15 dark:hover:text-[#cdcdcd]";

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative mx-auto flex w-full max-w-3xl flex-col">
      <div className="wrap-break-word text-[#0d0d0d] dark:text-[#ececec]">
        <MessagePrimitive.Parts>
          {({ part }) => {
            if (part.type === "text") return <ArtifactAssistantMarkdown />;
            if (part.type === "tool-call")
              return part.toolUI ?? <ToolFallback {...part} />;
            if (part.type === "file") return <AssistantFilePart {...part} />;
            return null;
          }}
        </MessagePrimitive.Parts>
      </div>
      <AssistantMessageError />

      <div className="-ml-2 flex items-center pt-1">
        <ActionBarPrimitive.Root hideWhenRunning className="flex items-center">
          <ActionBarPrimitive.Copy asChild>
            <TooltipIconButton
              tooltip="Copy"
              side="top"
              className={assistantActionClassName}
            >
              <AuiIf condition={(s) => s.message.isCopied}>
                <CheckIcon className="size-5" />
              </AuiIf>
              <AuiIf condition={(s) => !s.message.isCopied}>
                <CopyIcon className="size-5" />
              </AuiIf>
            </TooltipIconButton>
          </ActionBarPrimitive.Copy>
          <ActionBarPrimitive.FeedbackPositive asChild>
            <TooltipIconButton
              tooltip="Good response"
              side="top"
              className={assistantActionClassName}
            >
              <AuiIf
                condition={(s) =>
                  s.message.metadata.submittedFeedback?.type === "positive"
                }
              >
                <ThumbsUp className="size-5 fill-current" />
              </AuiIf>
              <AuiIf
                condition={(s) =>
                  s.message.metadata.submittedFeedback?.type !== "positive"
                }
              >
                <ThumbsUp className="size-5" />
              </AuiIf>
            </TooltipIconButton>
          </ActionBarPrimitive.FeedbackPositive>
          <ActionBarPrimitive.FeedbackNegative asChild>
            <TooltipIconButton
              tooltip="Bad response"
              side="top"
              className={assistantActionClassName}
            >
              <AuiIf
                condition={(s) =>
                  s.message.metadata.submittedFeedback?.type === "negative"
                }
              >
                <ThumbsDown className="size-5 fill-current" />
              </AuiIf>
              <AuiIf
                condition={(s) =>
                  s.message.metadata.submittedFeedback?.type !== "negative"
                }
              >
                <ThumbsDown className="size-5" />
              </AuiIf>
            </TooltipIconButton>
          </ActionBarPrimitive.FeedbackNegative>
          <ActionBarPrimitive.Speak asChild>
            <TooltipIconButton
              tooltip="Read aloud"
              side="top"
              className={assistantActionClassName}
            >
              <Volume2 className="size-5" />
            </TooltipIconButton>
          </ActionBarPrimitive.Speak>
          <TooltipIconButton
            tooltip="Share"
            side="top"
            className={assistantActionClassName}
          >
            <Share className="size-5" />
          </TooltipIconButton>
          <ActionBarPrimitive.Reload asChild>
            <TooltipIconButton
              tooltip="Regenerate"
              side="top"
              className={assistantActionClassName}
            >
              <RefreshCwIcon className="size-5" />
            </TooltipIconButton>
          </ActionBarPrimitive.Reload>
          <ActionBarMorePrimitive.Root>
            <ActionBarMorePrimitive.Trigger asChild>
              <button
                type="button"
                aria-label="More"
                className={cn(
                  assistantActionClassName,
                  "data-[state=open]:bg-black/[0.07] dark:data-[state=open]:bg-white/15",
                )}
              >
                <MoreHorizontal className="size-5" />
              </button>
            </ActionBarMorePrimitive.Trigger>
            <ActionBarMorePrimitive.Content
              side="bottom"
              align="end"
              sideOffset={6}
              className="z-50 min-w-40 overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=open]:animate-in data-[side=bottom]:slide-in-from-top-2"
            >
              <ActionBarPrimitive.ExportMarkdown asChild>
                <ActionBarMorePrimitive.Item className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none select-none focus:bg-accent focus:text-accent-foreground">
                  <Download className="size-5" />
                  Export as Markdown
                </ActionBarMorePrimitive.Item>
              </ActionBarPrimitive.ExportMarkdown>
            </ActionBarMorePrimitive.Content>
          </ActionBarMorePrimitive.Root>
        </ActionBarPrimitive.Root>
        <BranchPicker className="ml-1" />
      </div>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<{ className?: string }> = ({ className }) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "inline-flex items-center text-sm font-semibold text-muted-foreground dark:text-[#b4b4b4]",
        className,
      )}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous" className="text-[#b4b4b4]">
          <ChevronLeftIcon className="size-5" />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <BranchPickerPrimitive.Number />/<BranchPickerPrimitive.Count />
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next" className="text-[#b4b4b4]">
          <ChevronRightIcon className="size-5" />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

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
    useShallow((s): { file?: File; src?: string } => {
      if (s.attachment.type !== "image") return {};
      if (s.attachment.file) return { file: s.attachment.file };
      const src = s.attachment.content?.filter((c) => c.type === "image")[0]
        ?.image;
      if (!src) return {};
      return { src };
    }),
  );

  return useFileSrc(file) ?? src;
};

const ChatGPTAttachmentUI: FC = () => {
  const aui = useAui();
  const isComposer = aui.attachment.source !== "message";
  const src = useAttachmentSrc();

  return (
    <AttachmentPrimitive.Root className="group/attachment relative">
      <div className="flex items-center gap-2 overflow-hidden rounded-2xl border bg-secondary dark:bg-white/5">
        <AuiIf condition={(s) => s.attachment.type === "image"}>
          {src ? (
            // biome-ignore lint/performance/noImgElement: example component
            <img
              className="size-32 rounded-md object-cover"
              alt="Attachment"
              src={src}
            />
          ) : (
            <div className="flex h-full w-12 items-center justify-center rounded-md">
              <AttachmentPrimitive.unstable_Thumb className="text-xs" />
            </div>
          )}
        </AuiIf>
        <AuiIf condition={(s) => s.attachment.type !== "image"}>
          <div className="flex h-full w-12 items-center justify-center rounded-[9px] bg-background text-[#6b6b6b] dark:bg-[#3a3a3a] dark:text-[#9a9a9a]">
            <AttachmentPrimitive.unstable_Thumb className="text-xs" />
          </div>
        </AuiIf>
      </div>
      {isComposer && (
        <AttachmentPrimitive.Remove className="absolute -top-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#6b6b6b] transition-all hover:bg-[#f5f5f5] hover:text-[#0d0d0d] dark:border-[#3a3a3a] dark:bg-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:bg-[#252525] dark:hover:text-white">
          <XIcon className="size-5" />
        </AttachmentPrimitive.Remove>
      )}
    </AttachmentPrimitive.Root>
  );
};
