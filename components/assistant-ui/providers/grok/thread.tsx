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
} from "@assistant-ui/react";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { CopyIcon, Mic, Paperclip, Square, XIcon } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { useShallow } from "zustand/shallow";
import { ArtifactAssistantMarkdown } from "@/components/assistant-ui/artifacts/artifact-assistant-markdown";
import { AssistantFilePart } from "@/components/assistant-ui/message/assistant-file-part";
import { ImagePreviewDialog } from "@/components/assistant-ui/message/image-preview-dialog";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { useComposerTool } from "@/components/assistant-ui/contexts/composer-tool-context";
import { GrokWordmark } from "@/components/assistant-ui/providers/grok/icon";
import { AssistantMessageActionBar } from "@/components/assistant-ui/providers/shared/assistant-message-action-bar";
import { userMessageActionBarRootClass } from "@/components/assistant-ui/providers/shared/message-action-bar-styles";
import { ProviderModelPicker } from "@/components/assistant-ui/providers/shared/model-picker";
import { VoicePlaceholderButton } from "@/components/assistant-ui/providers/shared/voice-ui-placeholder";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import { ThreadUserMessageRoot } from "@/components/assistant-ui/shell/thread-user-message-root";

export const GrokThread: FC = () => (
  <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col items-stretch bg-[#fdfdfd] px-4 dark:bg-[#141414]">
    <AuiIf condition={(s) => s.thread.isEmpty}>
      <EmptyState />
    </AuiIf>

    <AuiIf condition={(s) => !s.thread.isEmpty}>
      <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col overflow-y-scroll pt-16 pb-52 scroll-pb-52">
        <ThreadPrimitive.Messages>
          {({ message }) => {
            if (message.composer.isEditing) return <EditComposer />;
            if (message.role === "user") return <UserMessage />;
            return <AssistantMessage />;
          }}
        </ThreadPrimitive.Messages>

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-3xl flex-col gap-2 overflow-visible bg-[#fdfdfd] pb-2 dark:bg-[#141414]">
          <ThreadScrollToBottom />
          <Composer />
          <ContextUsageIndicator
            variant="shadcn"
            className="justify-center text-[#9a9a9a] md:hidden dark:text-[#6b6b6b]"
          />
          <p className="mx-auto w-full max-w-3xl text-center text-[#9a9a9a] text-xs">
            Grok can make mistakes. Verify important information.
          </p>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
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

            <ComposerPrimitive.Input
              placeholder={composerPlaceholder ?? "What do you want to know?"}
              rows={1}
              className="my-2 h-6 max-h-100 min-w-0 flex-1 resize-none bg-transparent text-base leading-6 text-[#0d0d0d] outline-none placeholder:text-[#9a9a9a] dark:text-white dark:placeholder:text-[#6b6b6b]"
            />

            <ProviderModelPicker
              variant="grok"
              className="mb-0.5 group-data-[empty=false]/composer:max-w-9"
            />

            <GrokComposerPrimaryAction />
          </div>
        </div>
      </ComposerPrimitive.Root>
      {integrationNote ? (
        <p className="px-2 text-center text-[#9a9a9a] text-xs">{integrationNote}</p>
      ) : null}
    </div>
  );
};

const grokPrimaryBtnClass =
  "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out";

const GrokComposerPrimaryAction: FC = () => (
  <div className="relative mb-0.5 h-9 w-9 shrink-0 rounded-full bg-[#0d0d0d] text-white dark:bg-white dark:text-[#0d0d0d]">
    <AuiIf condition={(s) => !s.thread.isRunning && s.composer.isEmpty}>
      <VoicePlaceholderButton
        className={`${grokPrimaryBtnClass} rounded-full`}
        aria-label="Voice mode"
      >
        <Mic width={18} height={18} />
      </VoicePlaceholderButton>
    </AuiIf>

    <AuiIf condition={(s) => !s.thread.isRunning && !s.composer.isEmpty}>
      <ComposerPrimitive.Send className={`${grokPrimaryBtnClass} rounded-full`}>
        <ArrowUpIcon width={18} height={18} />
      </ComposerPrimitive.Send>
    </AuiIf>

    <AuiIf condition={(s) => s.thread.isRunning}>
      <ComposerPrimitive.Cancel className={`${grokPrimaryBtnClass} rounded-full`}>
        <Square width={14} height={14} fill="currentColor" />
      </ComposerPrimitive.Cancel>
    </AuiIf>
  </div>
);

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
          <MessagePrimitive.Parts components={{ Text: ArtifactAssistantMarkdown }} />
        </div>
      </div>
      <div className="mt-1 flex h-8 items-center justify-end gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
        <ActionBarPrimitive.Root className={cn("flex items-center gap-0.5", userMessageActionBarRootClass)}>
          <ActionBarPrimitive.Edit className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b6b] transition-colors hover:bg-[#e5e5e5] hover:text-[#0d0d0d] dark:text-[#9a9a9a] dark:hover:bg-[#2a2a2a] dark:hover:text-white">
            <Pencil1Icon width={16} height={16} />
          </ActionBarPrimitive.Edit>
          <ActionBarPrimitive.Copy className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b6b] transition-colors hover:bg-[#e5e5e5] hover:text-[#0d0d0d] dark:text-[#9a9a9a] dark:hover:bg-[#2a2a2a] dark:hover:text-white">
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
        <MessagePrimitive.Parts
          components={{ Text: ArtifactAssistantMarkdown, File: AssistantFilePart }}
        />
      </div>
    </div>
    <div className="mt-1 flex h-8 w-full items-center justify-start gap-0.5">
      <AssistantMessageActionBar variant="grok" className="-ml-2" />
      <BranchPicker className="ml-1" />
    </div>
  </MessagePrimitive.Root>
);

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
