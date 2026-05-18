"use client";

import {
  ActionBarPrimitive,
  AuiIf,
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";

import {
  Cross2Icon,
  Pencil1Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import {
  CopyIcon,
  Globe,
  Lightbulb,
  Mic,
  Music,
  PenLine,
  SendHorizonal,
  Sparkles,
  Square,
  Telescope,
} from "lucide-react";
import { type FC, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { MarkdownText } from "@/components/assistant-ui/message/markdown-text";
import { useComposerTool } from "@/components/assistant-ui/contexts/composer-tool-context";
import { AssistantMessageActionBar } from "@/components/assistant-ui/providers/shared/assistant-message-action-bar";
import { ComposerToolsMenu } from "@/components/assistant-ui/providers/shared/composer-tools-menu";
import { ProviderModelPicker } from "@/components/assistant-ui/providers/shared/model-picker";
import { VoicePlaceholderButton } from "@/components/assistant-ui/providers/shared/voice-ui-placeholder";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import {
  GEMINI_COMPOSER_TOOL_IDS,
  type ComposerToolId,
} from "@/lib/chat/composer-tools";
import { useAui } from "@assistant-ui/react";

const GEMINI_TOOLS_MENU = GEMINI_COMPOSER_TOOL_IDS.map((id) => {
  const icons = {
    research: Telescope,
    search: Globe,
    study: Lightbulb,
  } as const;
  const labels: Record<ComposerToolId, string> = {
    search: "Search the web",
    research: "Deep Research",
    think: "Think longer",
    study: "Help me learn",
  };
  return { id, label: labels[id], Icon: icons[id as keyof typeof icons] ?? Lightbulb };
});

export const GeminiThread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col items-stretch bg-[#f8f9fa] dark:bg-[#131314]">
      <AuiIf condition={(s) => s.thread.isEmpty}>
        <div className="flex h-full flex-col justify-center px-4">
          <div className="mx-auto w-full max-w-3xl">
            <p className="mb-1 text-black text-xl dark:text-white">Hi there</p>
            <p className="mb-6 text-3xl text-black sm:text-4xl dark:text-white">
              Where would you like to start?
            </p>
          </div>
          <Composer />
          <ContextUsageIndicator
            variant="shadcn"
            className="mx-auto mt-2 w-full max-w-3xl justify-center text-[#70757a] md:hidden dark:text-[#9aa0a6]"
          />
          <div className="mx-auto mt-4 flex w-full max-w-3xl flex-wrap justify-center gap-2">
            <SuggestionChip icon={<Music width={16} height={16} />}>
              Make music
            </SuggestionChip>
            <SuggestionChip toolId="study" icon={<Lightbulb width={16} height={16} />}>
              Help me learn
            </SuggestionChip>
            <SuggestionChip
              prompt="帮我写一段文案："
              icon={<PenLine width={16} height={16} />}
            >
              Write anything
            </SuggestionChip>
            <SuggestionChip toolId="research" icon={<Sparkles width={16} height={16} />}>
              Boost my day
            </SuggestionChip>
          </div>
        </div>
      </AuiIf>

      <AuiIf condition={(s) => !s.thread.isEmpty}>
        <ThreadPrimitive.Viewport className="flex grow flex-col overflow-y-scroll px-4 pt-16">
          <ThreadPrimitive.Messages components={{ Message: ChatMessage }} />
        </ThreadPrimitive.Viewport>
        <div className="space-y-2 px-4 pb-4">
          <Composer />
          <ContextUsageIndicator
            variant="shadcn"
            className="mx-auto w-full max-w-3xl justify-center text-[#70757a] md:hidden dark:text-[#9aa0a6]"
          />
          <p className="text-center text-[#70757a] text-xs dark:text-[#9aa0a6]">
            Gemini may display inaccurate info, including about people, so
            double-check its responses.
          </p>
        </div>
      </AuiIf>
    </ThreadPrimitive.Root>
  );
};

const SuggestionChip: FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
  toolId?: ComposerToolId;
  prompt?: string;
}> = ({ icon, children, toolId, prompt }) => {
  const aui = useAui();
  const { setTool } = useComposerTool();
  const disabled = useAuiState(
    (s) => s.thread.isDisabled || s.thread.isRunning,
  );

  const onClick = useCallback(() => {
    if (disabled) return;
    if (toolId) setTool(toolId);
    if (prompt) aui.composer().setText(prompt);
  }, [aui, disabled, prompt, setTool, toolId]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[#444746] text-sm shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#f1f3f4] disabled:opacity-50 dark:bg-[#282a2c] dark:text-[#c4c7c5] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] dark:hover:bg-[#333537]"
    >
      {icon}
      {children}
    </button>
  );
};

const geminiPrimaryBtnClass =
  "absolute inset-0 flex items-center justify-center rounded-full transition-all duration-300 ease-out";

const GeminiComposerPrimaryAction: FC = () => (
  <div className="relative size-10 shrink-0">
    <AuiIf condition={(s) => s.thread.isRunning}>
      <ComposerPrimitive.Cancel
        className={`${geminiPrimaryBtnClass} bg-[#d3e3fd] text-[#1f1f1f] hover:bg-[#c2d7fb] dark:bg-[#1f3760] dark:text-[#e3e3e3] dark:hover:bg-[#2a4a7a]`}
      >
        <Square width={14} height={14} fill="currentColor" />
      </ComposerPrimitive.Cancel>
    </AuiIf>

    <AuiIf condition={(s) => !s.thread.isRunning && !s.composer.isEmpty}>
      <ComposerPrimitive.Send
        className={`${geminiPrimaryBtnClass} bg-[#d3e3fd] text-[#1f1f1f] hover:bg-[#c2d7fb] dark:bg-[#1f3760] dark:text-[#e3e3e3] dark:hover:bg-[#2a4a7a]`}
      >
        <SendHorizonal width={20} height={20} />
      </ComposerPrimitive.Send>
    </AuiIf>

    <AuiIf condition={(s) => !s.thread.isRunning && s.composer.isEmpty}>
      <VoicePlaceholderButton
        className={`${geminiPrimaryBtnClass} hover:bg-[#444746]/8 dark:hover:bg-[#c4c7c5]/8`}
        aria-label="语音输入"
      >
        <Mic width={20} height={20} />
      </VoicePlaceholderButton>
    </AuiIf>
  </div>
);

const Composer: FC = () => {
  const isEmpty = useAuiState((s) => s.composer.isEmpty);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const { composerPlaceholder, integrationNote } = useComposerTool();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1">
    <ComposerPrimitive.Root
      data-empty={isEmpty}
      data-running={isRunning}
      className="group/composer mx-auto flex w-full max-w-3xl flex-col rounded-4xl bg-white p-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.16)] dark:bg-[#1e1f20] dark:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)]"
    >
      <AuiIf condition={(s) => s.composer.attachments.length > 0}>
        <div className="overflow-hidden rounded-t-3xl">
          <div className="overflow-x-auto p-3.5">
            <div className="flex flex-row gap-3">
              <ComposerPrimitive.Attachments
                components={{ Attachment: GeminiAttachment }}
              />
            </div>
          </div>
        </div>
      </AuiIf>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <div className="wrap-break-word max-h-96 w-full overflow-y-auto">
            <ComposerPrimitive.Input
              placeholder={composerPlaceholder}
              className="block min-h-6 w-full resize-none bg-transparent px-3 py-2 text-[#1f1f1f] outline-none placeholder:text-[#70757a] dark:text-[#e3e3e3] dark:placeholder:text-[#9aa0a6]"
            />
          </div>
        </div>

        <div className="flex w-full items-center text-[#444746] dark:text-[#c4c7c5]">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ComposerPrimitive.AddAttachment className="flex size-10 items-center justify-center rounded-full transition-all hover:bg-[#444746]/8 active:scale-[0.98] dark:hover:bg-[#c4c7c5]/8">
              <PlusIcon width={20} height={20} />
            </ComposerPrimitive.AddAttachment>
            <ComposerToolsMenu
              variant="gemini"
              tools={GEMINI_TOOLS_MENU}
              align="start"
            />
          </div>

          <div className="flex items-center gap-2">
            <ProviderModelPicker variant="gemini" />
            <GeminiComposerPrimaryAction />
          </div>
        </div>
      </div>
    </ComposerPrimitive.Root>
    {integrationNote ? (
      <p className="px-2 text-center text-[#70757a] text-xs dark:text-[#9aa0a6]">
        {integrationNote}
      </p>
    ) : null}
    </div>
  );
};

const actionBtnClass =
  "flex size-8 items-center justify-center rounded-full text-[#444746] transition-colors hover:bg-[#444746]/8 dark:text-[#c4c7c5] dark:hover:bg-[#c4c7c5]/8";

const ChatMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="group/message relative mx-auto mb-4 flex w-full max-w-3xl flex-col pb-0.5">
      <AuiIf condition={(s) => s.message.role === "user"}>
        <div className="flex items-center justify-end gap-1">
          <ActionBarPrimitive.Root className="flex items-center gap-0.5 pt-1 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100">
            <ActionBarPrimitive.Copy className={actionBtnClass}>
              <CopyIcon width={16} height={16} />
            </ActionBarPrimitive.Copy>
            <ActionBarPrimitive.Edit className={actionBtnClass}>
              <Pencil1Icon width={16} height={16} />
            </ActionBarPrimitive.Edit>
          </ActionBarPrimitive.Root>
          <div className="max-w-[85%] rounded-3xl rounded-tr bg-[#e9eef6] px-4 py-3 text-[#1f1f1f] dark:bg-[#282a2c] dark:text-[#e3e3e3]">
            <div className="prose prose-sm dark:prose-invert wrap-break-word">
              <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
            </div>
          </div>
        </div>
      </AuiIf>

      <AuiIf condition={(s) => s.message.role === "assistant"}>
        <div>
          <div className="prose prose-sm dark:prose-invert wrap-break-word prose-li:my-1 prose-ol:my-1 prose-p:my-2 prose-ul:my-1 text-[#1f1f1f] dark:text-[#e3e3e3]">
            <MessagePrimitive.Parts components={{ Text: MarkdownText }} />
          </div>
          <AssistantMessageActionBar
            variant="gemini"
            className="mt-2 -ml-2 opacity-0 transition-opacity duration-300 group-focus-within/message:opacity-100 group-hover/message:opacity-100"
          />
        </div>
      </AuiIf>
    </MessagePrimitive.Root>
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
      <div
        className="overflow-hidden rounded-lg border border-[#dadce0] shadow-sm hover:border-[#c4c7c5] hover:shadow-md dark:border-[#3c4043] dark:hover:border-[#5f6368]"
        style={{
          width: "120px",
          height: "120px",
          minWidth: "120px",
          minHeight: "120px",
        }}
      >
        <button
          type="button"
          className="relative"
          style={{ width: "120px", height: "120px" }}
        >
          {isImage && src ? (
            // biome-ignore lint/performance/noImgElement: example component
            <img
              className="h-full w-full object-cover transition duration-400"
              alt="Attachment"
              src={src}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#70757a] dark:text-[#9aa0a6]">
              <AttachmentPrimitive.unstable_Thumb className="text-xs" />
            </div>
          )}
        </button>
      </div>
      <AttachmentPrimitive.Remove
        className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full border border-[#dadce0] bg-white text-[#70757a] opacity-0 backdrop-blur-sm transition-all hover:bg-[#f1f3f4] hover:text-[#1f1f1f] group-focus-within/thumbnail:opacity-100 group-hover/thumbnail:opacity-100 dark:border-[#3c4043] dark:bg-[#1e1f20] dark:text-[#9aa0a6] dark:hover:bg-[#2b2c2f] dark:hover:text-[#e3e3e3]"
        aria-label="Remove attachment"
      >
        <Cross2Icon width={16} height={16} />
      </AttachmentPrimitive.Remove>
    </AttachmentPrimitive.Root>
  );
};
