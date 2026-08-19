"use client";

import { cn } from "@/lib/utils";
import {
  ActionBarPrimitive,
  AuiIf,
  AttachmentPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
  useMessageTiming,
} from "@assistant-ui/react";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { CopyIcon, Mic, Paperclip, RefreshCwIcon, Square, ThumbsDown, ThumbsUp, XIcon } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { useShallow } from "zustand/shallow";
import { ArtifactAssistantMarkdown } from "@/components/assistant-ui/artifacts/artifact-assistant-markdown";
import { ImagePreviewDialog } from "@/components/assistant-ui/message/image-preview-dialog";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { useComposerTool } from "@/components/assistant-ui/contexts/composer-tool-context";
import { GrokWordmark } from "@/components/assistant-ui/providers/grok/icon";
import { ComposerToolsMenu } from "@/components/assistant-ui/providers/shared/composer-tools-menu";
import { GROK_TOOLS_MENU } from "@/components/assistant-ui/providers/shared/composer-tools-menu-items";
import { ProviderAssistantParts } from "@/components/assistant-ui/providers/shared/provider-assistant-parts";
import { AssistantMessageError } from "@/components/assistant-ui/providers/shared/assistant-message-error";
import { ProviderModelPicker } from "@/components/assistant-ui/providers/shared/model-picker";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import { ThreadUserMessageRoot } from "@/components/assistant-ui/shell/thread-user-message-root";

export const GrokThread: FC = () => (
  <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col items-stretch overflow-hidden bg-[#fdfdfd] px-4 dark:bg-[#141414]">
    <AuiIf condition={(s) => s.thread.isEmpty}>
      <EmptyState />
    </AuiIf>

    <AuiIf condition={(s) => !s.thread.isEmpty}>
      <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col overflow-y-scroll pt-16">
        <ThreadPrimitive.Messages>
          {({ message }) => {
            if (message.composer.isEditing) return <EditComposer />;
            if (message.role === "user") return <UserMessage />;
            return <AssistantMessage />;
          }}
        </ThreadPrimitive.Messages>

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto flex justify-center overflow-visible bg-[#fdfdfd] pb-2 dark:bg-[#141414]">
          <ThreadScrollToBottom />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
      <div className="mx-auto w-full max-w-3xl shrink-0 pb-2">
        <Composer />
        <ContextUsageIndicator
          variant="shadcn"
          className="justify-center text-[#9a9a9a] md:hidden dark:text-[#6b6b6b]"
        />
        <p className="mx-auto w-full max-w-3xl text-center text-[#9a9a9a] text-xs">
          Grok can make mistakes. Verify important information.
        </p>
      </div>
    </AuiIf>
  </ThreadPrimitive.Root>
);

const EmptyState: FC = () => (
  <div className="flex h-full flex-col items-center justify-center">
    <GrokWordmark className="mb-6 h-10 text-[#0d0d0d] dark:text-white" />
    <div className="w-full max-w-3xl">
      <Composer />
    </div>
  </div>
);

const Composer: FC = () => {
  const isEmpty = useAuiState((s) => s.composer.isEmpty);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const { composerPlaceholder, integrationNote } = useComposerTool();

  return (
    <div className="mx-auto mb-3 flex w-full max-w-3xl flex-col gap-1">
      <ComposerPrimitive.Root
        className="group/composer w-full"
        data-empty={isEmpty}
        data-running={isRunning}
      >
        <div className="overflow-hidden rounded-4xl bg-[#f8f8f8] ring-1 ring-[#e5e5e5] ring-inset transition-shadow focus-within:ring-[#d0d0d0] dark:bg-[#212121] dark:ring-[#2a2a2a] dark:focus-within:ring-[#3a3a3a]">
          <AuiIf condition={(s) => s.composer.attachments.length > 0}>
            <div className="flex flex-row flex-wrap gap-2 px-4 pt-3">
              <ComposerPrimitive.Attachments>
                {() => <GrokAttachment />}
              </ComposerPrimitive.Attachments>
            </div>
          </AuiIf>

          <div className="flex items-end gap-1 p-2">
            <ComposerPrimitive.AddAttachment className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0d0d0d] transition-colors hover:bg-[#f0f0f0] dark:text-white dark:hover:bg-[#2a2a2a]">
              <Paperclip width={18} height={18} />
            </ComposerPrimitive.AddAttachment>
            <ComposerToolsMenu
              variant="grok"
              tools={GROK_TOOLS_MENU}
              align="start"
            />

            <ComposerPrimitive.Input
              placeholder={composerPlaceholder ?? "What do you want to know?"}
              rows={1}
              className="my-2 h-6 max-h-100 min-w-0 flex-1 resize-none bg-transparent text-base leading-6 text-[#0d0d0d] outline-none placeholder:text-[#9a9a9a] dark:text-white dark:placeholder:text-[#6b6b6b]"
            />

            <ProviderModelPicker
              variant="grok"
              className="mb-0.5 overflow-hidden group-data-[empty=false]/composer:max-w-9"
            />

            <div className="relative mb-0.5 h-9 w-9 shrink-0 rounded-full bg-[#0d0d0d] text-white dark:bg-white dark:text-[#0d0d0d]">
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out group-data-[empty=false]/composer:scale-0 group-data-[empty=false]/composer:opacity-0 group-data-[running=true]/composer:scale-0 group-data-[running=true]/composer:opacity-0"
                aria-label="Voice mode"
                tabIndex={-1}
              >
                <Mic width={18} height={18} />
              </button>

              <ComposerPrimitive.Send className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out group-data-[empty=true]/composer:scale-0 group-data-[empty=true]/composer:opacity-0 group-data-[running=true]/composer:scale-0 group-data-[running=true]/composer:opacity-0">
                <ArrowUpIcon width={18} height={18} />
              </ComposerPrimitive.Send>

              <ComposerPrimitive.Cancel className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out group-data-[running=false]/composer:scale-0 group-data-[running=false]/composer:opacity-0">
                <Square width={14} height={14} fill="currentColor" />
              </ComposerPrimitive.Cancel>
            </div>
          </div>
        </div>
      </ComposerPrimitive.Root>
      {integrationNote ? (
        <p className="px-2 text-center text-[#9a9a9a] text-xs">{integrationNote}</p>
      ) : null}
    </div>
  );
};

const grokActionClass =
  "flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b6b] transition-colors hover:bg-[#e5e5e5] hover:text-[#0d0d0d] dark:text-[#9a9a9a] dark:hover:bg-[#2a2a2a] dark:hover:text-white";

const ThreadScrollToBottom: FC = () => (
  <ThreadPrimitive.ScrollToBottom asChild>
    <TooltipIconButton
      tooltip="Scroll to bottom"
      className="absolute -top-10 z-10 self-center rounded-full border border-[#e5e5e5] bg-[#fdfdfd] p-2 shadow-sm disabled:invisible dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
    >
      <ChevronDownIcon />
    </TooltipIconButton>
  </ThreadPrimitive.ScrollToBottom>
);

const UserMessage: FC = () => (
  <ThreadUserMessageRoot className="group/message relative mx-auto mb-2 flex w-full max-w-3xl flex-col items-end pb-0.5">
    <div className="flex flex-row flex-wrap justify-end gap-2">
      <MessagePrimitive.Attachments>
        {() => <GrokAttachment />}
      </MessagePrimitive.Attachments>
    </div>
    <div className="flex flex-col items-end">
      <div className="relative max-w-[90%] rounded-3xl rounded-br-lg border border-[#e5e5e5] bg-[#f0f0f0] px-4 py-3 text-[#0d0d0d] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white">
        <div className="prose prose-sm dark:prose-invert wrap-break-word prose-p:my-0">
        <MessagePrimitive.Parts>
          {({ part }) => {
            if (part.type === "text") return <ArtifactAssistantMarkdown />;
            return null;
          }}
        </MessagePrimitive.Parts>
        </div>
      </div>
      <div className="mt-1 flex h-8 items-center justify-end gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
        <ActionBarPrimitive.Root className="flex items-center gap-0.5">
          <ActionBarPrimitive.Edit className={grokActionClass}>
            <Pencil1Icon width={16} height={16} />
          </ActionBarPrimitive.Edit>
          <ActionBarPrimitive.Copy className={grokActionClass}>
            <CopyIcon width={16} height={16} />
          </ActionBarPrimitive.Copy>
        </ActionBarPrimitive.Root>
      </div>
    </div>
  </ThreadUserMessageRoot>
);

const EditComposer: FC = () => (
  <ComposerPrimitive.Root className="mx-auto mb-2 flex w-full max-w-3xl flex-col justify-end gap-1 overflow-hidden rounded-3xl bg-[#f8f8f8] ring-1 ring-[#e5e5e5] dark:bg-[#212121] dark:ring-[#2a2a2a]">
    <ComposerPrimitive.Input className="flex h-8 w-full resize-none bg-transparent p-5 pb-0 text-[#0d0d0d] outline-none dark:text-white" />
    <div className="m-3 mt-2 flex items-center justify-center gap-2 self-end">
      <ComposerPrimitive.Cancel className="rounded-full bg-white px-3 py-2 font-semibold text-[#0d0d0d] text-sm hover:bg-[#f0f0f0] dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#2a2a2a]">
        Cancel
      </ComposerPrimitive.Cancel>
      <ComposerPrimitive.Send className="rounded-full bg-[#0d0d0d] px-3 py-2 font-semibold text-sm text-white hover:bg-black dark:bg-white dark:text-[#0d0d0d] dark:hover:bg-[#e5e5e5]">
        Send
      </ComposerPrimitive.Send>
    </div>
  </ComposerPrimitive.Root>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="group/message relative mx-auto mb-2 flex w-full max-w-3xl flex-col pb-0.5">
    <div className="w-full max-w-none">
      <div className="prose prose-sm dark:prose-invert wrap-break-word prose-li:my-1 prose-ol:my-1 prose-p:my-2 prose-ul:my-1 text-[#0d0d0d] dark:text-[#e5e5e5]">
        <ProviderAssistantParts />
      </div>
    </div>
    <AssistantMessageError />
    <div className="mt-1 flex h-8 w-full items-center justify-start gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
      <ActionBarPrimitive.Root className="-ml-2 flex items-center gap-0.5">
        <ActionBarPrimitive.Reload className={grokActionClass}>
          <RefreshCwIcon width={16} height={16} />
        </ActionBarPrimitive.Reload>
        <ActionBarPrimitive.Copy className={grokActionClass}>
          <CopyIcon width={16} height={16} />
        </ActionBarPrimitive.Copy>
        <ActionBarPrimitive.FeedbackPositive className={grokActionClass}>
          <ThumbsUp width={16} height={16} />
        </ActionBarPrimitive.FeedbackPositive>
        <ActionBarPrimitive.FeedbackNegative className={grokActionClass}>
          <ThumbsDown width={16} height={16} />
        </ActionBarPrimitive.FeedbackNegative>
        <MessageTimingDisplay />
      </ActionBarPrimitive.Root>
      <BranchPicker className="ml-1" />
    </div>
  </MessagePrimitive.Root>
);

const formatTime = (ms: number | undefined) => {
  if (ms === undefined) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const formatMs = (ms: number | undefined) => {
  if (ms === undefined) return "\u2014";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const MessageTimingDisplay: FC = () => {
  const timing = useMessageTiming();
  if (!timing?.totalStreamTime) return null;

  const totalTimeText = formatTime(timing.totalStreamTime);
  if (!totalTimeText) return null;

  return (
    <div className="group/timing relative">
      <button
        type="button"
        className="ml-1 flex h-auto items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-xs text-[#6b6b6b] tabular-nums transition-colors hover:bg-[#e5e5e5] hover:text-[#0d0d0d] dark:text-[#9a9a9a] dark:hover:bg-[#2a2a2a] dark:hover:text-white"
      >
        {totalTimeText}
      </button>
      <div className="pointer-events-none absolute top-1/2 left-full z-10 ml-2 -translate-y-1/2 scale-95 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 opacity-0 transition-all group-hover/timing:pointer-events-auto group-hover/timing:scale-100 group-hover/timing:opacity-100 before:absolute before:top-0 before:-left-2 before:h-full before:w-2 before:content-[''] dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
        <div className="grid min-w-[140px] gap-1.5 text-xs">
          {timing.firstTokenTime !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6b6b6b] dark:text-[#9a9a9a]">
                First token
              </span>
              <span className="font-mono text-[#0d0d0d] tabular-nums dark:text-white">
                {formatMs(timing.firstTokenTime)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#6b6b6b] dark:text-[#9a9a9a]">Total</span>
            <span className="font-mono text-[#0d0d0d] tabular-nums dark:text-white">
              {formatMs(timing.totalStreamTime)}
            </span>
          </div>
          {timing.tokensPerSecond !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6b6b6b] dark:text-[#9a9a9a]">Speed</span>
              <span className="font-mono text-[#0d0d0d] tabular-nums dark:text-white">
                {timing.tokensPerSecond.toFixed(1)} tok/s
              </span>
            </div>
          )}
          {timing.totalChunks > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#6b6b6b] dark:text-[#9a9a9a]">Chunks</span>
              <span className="font-mono text-[#0d0d0d] tabular-nums dark:text-white">
                {timing.totalChunks}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BranchPicker: FC<{ className?: string }> = ({ className }) => (
  <BranchPickerPrimitive.Root
    hideWhenSingleBranch
    className={cn(
      "inline-flex items-center font-semibold text-[#6b6b6b] text-sm dark:text-[#9a9a9a]",
      className,
    )}
  >
    <BranchPickerPrimitive.Previous asChild>
      <TooltipIconButton tooltip="Previous" className="text-[#6b6b6b] dark:text-[#9a9a9a]">
        <ChevronLeftIcon />
      </TooltipIconButton>
    </BranchPickerPrimitive.Previous>
    <BranchPickerPrimitive.Number />/<BranchPickerPrimitive.Count />
    <BranchPickerPrimitive.Next asChild>
      <TooltipIconButton tooltip="Next" className="text-[#6b6b6b] dark:text-[#9a9a9a]">
        <ChevronRightIcon />
      </TooltipIconButton>
    </BranchPickerPrimitive.Next>
  </BranchPickerPrimitive.Root>
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
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return src;
};

const useAttachmentSrc = () => {
  const { file, src } = useAuiState(
    useShallow((s): { file?: File; src?: string } => {
      if (s.attachment.type !== "image") return {};
      if (s.attachment.file) return { file: s.attachment.file };
      const image = s.attachment.content?.filter((c) => c.type === "image")[0]
        ?.image;
      if (!image) return {};
      return { src: image };
    }),
  );

  return useFileSrc(file) ?? src;
};

const GrokAttachment: FC = () => {
  const aui = useAui();
  const isComposer = aui.attachment.source !== "message";
  const src = useAttachmentSrc();

  return (
    <AttachmentPrimitive.Root className="group/attachment relative">
      <div className="flex h-12 items-center gap-2 overflow-hidden rounded-xl border border-[#e5e5e5] bg-[#f0f0f0] p-0.5 transition-colors hover:border-[#d0d0d0] dark:border-[#2a2a2a] dark:bg-[#252525] dark:hover:border-[#3a3a3a]">
        <AuiIf condition={(s) => s.attachment.type === "image"}>
          {src ? (
            <ImagePreviewDialog src={src} alt="Attachment">
              <button type="button" className="h-full cursor-zoom-in">
                <img
                  className="h-full w-12 rounded-[9px] object-cover"
                  alt="Attachment"
                  src={src}
                />
              </button>
            </ImagePreviewDialog>
          ) : (
            <div className="flex h-full w-12 items-center justify-center rounded-[9px] bg-[#e5e5e5] text-[#6b6b6b] dark:bg-[#3a3a3a] dark:text-[#9a9a9a]">
              <AttachmentPrimitive.unstable_Thumb className="text-xs" />
            </div>
          )}
        </AuiIf>
        <AuiIf condition={(s) => s.attachment.type !== "image"}>
          <div className="flex h-full w-12 items-center justify-center rounded-[9px] bg-[#e5e5e5] text-[#6b6b6b] dark:bg-[#3a3a3a] dark:text-[#9a9a9a]">
            <AttachmentPrimitive.unstable_Thumb className="text-xs" />
          </div>
        </AuiIf>
      </div>
      {isComposer ? (
        <AttachmentPrimitive.Remove className="absolute -top-1.5 -right-1.5 flex h-6 w-6 scale-50 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#6b6b6b] opacity-0 transition-all group-hover/attachment:scale-100 group-hover/attachment:opacity-100 hover:bg-[#f5f5f5] hover:text-[#0d0d0d] dark:border-[#3a3a3a] dark:bg-[#1a1a1a] dark:text-[#9a9a9a] dark:hover:bg-[#252525] dark:hover:text-white">
          <XIcon width={14} height={14} />
        </AttachmentPrimitive.Remove>
      ) : null}
    </AttachmentPrimitive.Root>
  );
};
