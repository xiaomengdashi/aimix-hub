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
  Cross2Icon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { useEffect, useState, type FC } from "react";
import { AssistantFilePart } from "@/components/assistant-ui/message/assistant-file-part";
import { ArtifactAssistantMarkdown } from "@/components/assistant-ui/artifacts/artifact-assistant-markdown";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { useShallow } from "zustand/shallow";
import { Mic, PlusIcon } from "lucide-react";
import { useComposerTool } from "@/components/assistant-ui/contexts/composer-tool-context";
import { ComposerToolsMenu } from "@/components/assistant-ui/providers/shared/composer-tools-menu";
import { CHATGPT_TOOLS_MENU } from "@/components/assistant-ui/providers/shared/composer-tools-menu-items";
import { AssistantMessageActionBar } from "@/components/assistant-ui/providers/shared/assistant-message-action-bar";
import { userMessageActionBarRootClass } from "@/components/assistant-ui/providers/shared/message-action-bar-styles";
import { VoicePlaceholderButton } from "@/components/assistant-ui/providers/shared/voice-ui-placeholder";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import { ThreadUserMessageRoot } from "@/components/assistant-ui/shell/thread-user-message-root";

export const ChatGPTThread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col items-stretch bg-white px-4 text-[#0d0d0d] dark:bg-[#212121] dark:text-[#ececec]">
      <AuiIf condition={(s) => s.thread.isEmpty}>
        <EmptyState />
      </AuiIf>

      <AuiIf condition={(s) => !s.thread.isEmpty}>
        <ThreadPrimitive.Viewport className="flex min-h-0 flex-1 flex-col gap-8 overflow-x-hidden overflow-y-scroll scroll-pb-52 pt-16 pb-52">
          <ThreadPrimitive.Messages>
            {({ message }) => {
              if (message.composer.isEditing) return <EditComposer />;
              if (message.role === "user") return <UserMessage />;
              return <AssistantMessage />;
            }}
          </ThreadPrimitive.Messages>

          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-3xl flex-col gap-2 overflow-visible rounded-t-3xl bg-white pb-2 dark:bg-[#212121]">
            <ThreadScrollToBottom />
            <Composer placeholder="Ask anything" />
            <ContextUsageIndicator
              variant="shadcn"
              className="justify-center text-[#5d5d5d] md:hidden dark:text-[#a8a8a8]"
            />
            <p className="text-center text-[#5d5d5d] text-xs dark:text-[#a8a8a8]">
              ChatGPT can make mistakes. Check important info.
            </p>
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </AuiIf>
    </ThreadPrimitive.Root>
  );
};

const EmptyState: FC = () => {
  return (
    <div className="flex grow flex-col items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-6">
        <h1 className="text-center font-medium text-2xl text-[#0d0d0d] sm:text-3xl dark:text-[#ececec]">
          Where should we begin?
        </h1>
        <Composer placeholder="Ask anything" />
        <ContextUsageIndicator
          variant="shadcn"
          className="justify-center text-[#5d5d5d] md:hidden dark:text-[#a8a8a8]"
        />
      </div>
    </div>
  );
};

const Composer: FC<{ placeholder?: string }> = ({ placeholder: placeholderProp }) => {
  const { composerPlaceholder, integrationNote } = useComposerTool();
  const placeholder = placeholderProp ?? composerPlaceholder;

  return (
    <div className="flex w-full flex-col gap-1">
    <ComposerPrimitive.Root className="group/composer flex w-full flex-col rounded-[28px] border border-[#e5e5e5] bg-white px-2 py-2 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.05)] focus-within:border-[#d0d0d0] dark:border-transparent dark:bg-[#303030] dark:shadow-none dark:focus-within:border-transparent">
      <AuiIf condition={(s) => s.composer.attachments.length > 0}>
        <div className="flex flex-row flex-wrap gap-2 px-1 pt-1 pb-2">
          <ComposerPrimitive.Attachments
            components={{ Attachment: ChatGPTAttachmentUI }}
          />
        </div>
      </AuiIf>

      <ComposerPrimitive.Input
        placeholder={placeholder}
        rows={1}
        className="min-h-9 w-full resize-none bg-transparent px-3 pt-2 text-[#0d0d0d] text-base outline-none placeholder:text-[#8e8e8e] dark:text-[#ececec] dark:placeholder:text-[#8e8e8e]"
      />

      <div className="flex w-full items-center gap-2 px-1 pt-1">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <ComposerPrimitive.AddAttachment asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full text-[#5d5d5d] transition-colors hover:bg-[#0d0d0d]/5 hover:text-[#0d0d0d] dark:text-[#cdcdcd] dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Add attachment"
            >
              <PlusIcon size={18} />
            </button>
          </ComposerPrimitive.AddAttachment>
          <ComposerToolsMenu
            variant="chatgpt"
            tools={CHATGPT_TOOLS_MENU}
            align="start"
          />
        </div>

        <div className="flex items-center gap-1">
          <ComposerPrimaryAction />
        </div>
      </div>
    </ComposerPrimitive.Root>
    {integrationNote ? (
      <p className="px-3 text-center text-[#8e8e8e] text-xs dark:text-[#8e8e8e]">
        {integrationNote}
      </p>
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

      <AuiIf condition={(s) => !s.thread.isRunning && !s.composer.isEmpty}>
        <ComposerPrimitive.Send className="flex size-9 items-center justify-center rounded-full bg-[#0d0d0d] text-white transition-opacity disabled:opacity-30 dark:bg-white dark:text-black">
          <ArrowUpIcon className="size-5" />
        </ComposerPrimitive.Send>
      </AuiIf>

      <AuiIf condition={(s) => !s.thread.isRunning && s.composer.isEmpty}>
        <VoicePlaceholderButton
          className="flex size-9 items-center justify-center rounded-full text-[#5d5d5d] dark:text-[#cdcdcd]"
          aria-label="语音输入"
        >
          <Mic className="size-4" />
        </VoicePlaceholderButton>
      </AuiIf>
    </div>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        className="absolute -top-10 z-10 self-center rounded-full border bg-background p-2 shadow-sm disabled:invisible dark:border-white/15 dark:bg-[#2a2a2a]"
      >
        <ChevronDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const UserMessage: FC = () => {
  return (
    <ThreadUserMessageRoot className="group/message relative mx-auto flex w-full max-w-3xl flex-col items-end gap-1">
      <div className="flex flex-row flex-wrap justify-end gap-2">
        <MessagePrimitive.Attachments
          components={{ Attachment: ChatGPTAttachmentUI }}
        />
      </div>

      <div className="flex items-start gap-4">
        <ActionBarPrimitive.Root
          hideWhenRunning
          className={cn("mt-2", userMessageActionBarRootClass)}
        >
          <ActionBarPrimitive.Edit asChild>
            <TooltipIconButton tooltip="Edit" className="text-[#b4b4b4]">
              <Pencil1Icon />
            </TooltipIconButton>
          </ActionBarPrimitive.Edit>
        </ActionBarPrimitive.Root>

        <div className="rounded-3xl bg-secondary px-5 py-2 text-foreground dark:bg-white/5 dark:text-[#eee]">
          <MessagePrimitive.Parts />
        </div>
      </div>

      <BranchPicker className="mt-2 mr-3" />
    </ThreadUserMessageRoot>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="mx-auto flex w-full max-w-3xl flex-col justify-end gap-1 rounded-3xl bg-secondary dark:bg-white/15">
      <ComposerPrimitive.Input className="flex h-8 w-full resize-none bg-transparent p-5 pb-0 text-foreground outline-none dark:text-white" />

      <div className="m-3 mt-2 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel className="rounded-full bg-background px-3 py-2 font-semibold text-foreground text-sm hover:bg-muted dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800">
          Cancel
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send className="rounded-full bg-primary px-3 py-2 font-semibold text-primary-foreground text-sm hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
          Send
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="group/message relative mx-auto flex w-full max-w-3xl flex-col">
      <div className="min-w-0 wrap-break-word text-[#0d0d0d] dark:text-[#ececec]">
        <MessagePrimitive.Parts
          components={{ Text: ArtifactAssistantMarkdown, File: AssistantFilePart }}
          unstable_showEmptyOnNonTextEnd={false}
        />
      </div>

      <div className="-ml-2 flex items-center pt-1">
        <AssistantMessageActionBar variant="chatgpt" />
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
        "inline-flex items-center font-semibold text-muted-foreground text-sm dark:text-[#b4b4b4]",
        className,
      )}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous" className="text-[#b4b4b4]">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <BranchPickerPrimitive.Number />/<BranchPickerPrimitive.Count />
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next" className="text-[#b4b4b4]">
          <ChevronRightIcon />
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
          <Cross2Icon fontSize={8} />
        </AttachmentPrimitive.Remove>
      )}
    </AttachmentPrimitive.Root>
  );
};
