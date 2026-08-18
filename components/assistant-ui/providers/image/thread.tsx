"use client";

import {
  ActionBarPrimitive,
  AuiIf,
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
import { useCallback, type FC, type ReactNode } from "react";
import { ImageAppLogo } from "@/components/assistant-ui/providers/image/icon";
import { AssistantFilePart } from "@/components/assistant-ui/message/assistant-file-part";
import { ArtifactAssistantMarkdown } from "@/components/assistant-ui/artifacts/artifact-assistant-markdown";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { AssistantMessageActionBar } from "@/components/assistant-ui/providers/shared/assistant-message-action-bar";
import { userMessageActionBarRootClass } from "@/components/assistant-ui/providers/shared/message-action-bar-styles";
import { ThreadUserMessageRoot } from "@/components/assistant-ui/shell/thread-user-message-root";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "一只在月球上冲浪的柴犬，卡通风格",
  "赛博朋克风格的上海外滩夜景",
  "水彩画风格的樱花与富士山",
  "极简扁平插画：一杯咖啡与一本打开的书",
];

export const ImageThread: FC = () => (
  <ThreadPrimitive.Root className="flex h-full flex-col items-stretch px-4">
    <AuiIf condition={(s) => s.thread.isEmpty}>
      <EmptyState />
    </AuiIf>

    <AuiIf condition={(s) => !s.thread.isEmpty}>
      <ThreadPrimitive.Viewport className="flex grow flex-col gap-8 overflow-x-hidden overflow-y-scroll scroll-pb-52 pt-16">
        <ThreadPrimitive.Messages>
          {({ message }) => {
            if (message.composer.isEditing) return <EditComposer />;
            if (message.role === "user") return <UserMessage />;
            return <AssistantMessage />;
          }}
        </ThreadPrimitive.Messages>

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-3xl flex-col gap-2 overflow-visible rounded-t-3xl bg-[#f7faff] pb-2 dark:bg-[#0f1419]">
          <ThreadScrollToBottom />
          <Composer />
          <p className="text-center text-[#3d5a8c] text-xs dark:text-[#8ab4f8]">
            生成图片约需 1 分钟，请耐心等待。
          </p>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </AuiIf>
  </ThreadPrimitive.Root>
);

const EmptyState: FC = () => (
  <div className="flex grow flex-col items-center justify-center px-4">
    <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="relative mb-1">
          <div
            className="absolute inset-0 scale-110 rounded-2xl bg-gradient-to-br from-violet-400/30 via-pink-400/25 to-cyan-400/30 blur-xl dark:from-violet-500/20 dark:via-pink-500/15 dark:to-cyan-500/20"
            aria-hidden
          />
          <ImageAppLogo variant="logo" className="relative drop-shadow-md" />
        </div>
        <h1 className="bg-gradient-to-r from-[#5b21b6] via-[#be185d] to-[#0e7490] bg-clip-text font-semibold text-2xl text-transparent sm:text-3xl dark:from-[#ddd6fe] dark:via-[#fbcfe8] dark:to-[#a5f3fc]">
          描述你想生成的图像
        </h1>
        <p className="max-w-md text-[#3d5a8c] text-sm dark:text-[#8ab4f8]">
          使用 GPT Image 2 文生图，支持中文与英文提示词
        </p>
      </div>
      <Composer />
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((text) => (
          <SuggestionChip key={text} prompt={text}>
            {text}
          </SuggestionChip>
        ))}
      </div>
    </div>
  </div>
);

const SuggestionChip: FC<{
  icon?: ReactNode;
  children: ReactNode;
  prompt: string;
}> = ({ icon, children, prompt }) => {
  const aui = useAui();
  const disabled = useAuiState(
    (s) => s.thread.isDisabled || s.thread.isRunning,
  );

  const onClick = useCallback(() => {
    if (disabled) return;
    aui.composer.setText(prompt);
  }, [aui, disabled, prompt]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex max-w-full items-center gap-2 rounded-full border border-[#d4e4ff] bg-white px-3 py-1.5 text-[#0d3b8c] text-sm transition-colors hover:bg-[#e6efff] disabled:opacity-50 dark:border-[#3d4f6f] dark:bg-[#1a2332] dark:text-[#b8d4ff] dark:hover:bg-[#243044]"
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
};

const Composer: FC = () => (
  <ComposerPrimitive.Root className="group/composer flex w-full flex-col rounded-[28px] border border-[#d4e4ff] bg-white px-2 py-2 shadow-sm focus-within:border-[#a8c8ff] dark:border-[#3d4f6f] dark:bg-[#1a2332] dark:focus-within:border-[#5a7ab0]">
    <ComposerPrimitive.Input
      placeholder="描述你想生成的图像…"
      rows={2}
      className="min-h-12 w-full resize-none bg-transparent px-3 pt-2 text-[#0d3b8c] text-base outline-none placeholder:text-[#6b8fc7] dark:text-[#b8d4ff] dark:placeholder:text-[#6b8fc7]"
    />
    <ComposerActions />
  </ComposerPrimitive.Root>
);

const ComposerActions: FC = () => (
  <div className="flex w-full items-center justify-end px-1 pt-1">
    <AuiIf condition={(s) => s.thread.isRunning}>
      <ComposerPrimitive.Cancel className="flex size-9 items-center justify-center rounded-full bg-[#1a73e8] text-white dark:bg-[#8ab4f8] dark:text-[#0f1419]">
        <div className="size-2.5 rounded-[2px] bg-current" />
      </ComposerPrimitive.Cancel>
    </AuiIf>
    <AuiIf condition={(s) => !s.thread.isRunning}>
      <ComposerPrimitive.Send className="flex size-9 items-center justify-center rounded-full bg-[#1a73e8] text-white transition-opacity disabled:opacity-30 dark:bg-[#8ab4f8] dark:text-[#0f1419]">
        <ArrowUpIcon className="size-5" />
      </ComposerPrimitive.Send>
    </AuiIf>
  </div>
);

const ThreadScrollToBottom: FC = () => (
  <ThreadPrimitive.ScrollToBottom asChild>
    <TooltipIconButton
      tooltip="滚动到底部"
      className="absolute -top-10 z-10 self-center rounded-full border bg-background p-2 shadow-sm disabled:invisible"
    >
      <ChevronDownIcon />
    </TooltipIconButton>
  </ThreadPrimitive.ScrollToBottom>
);

const UserMessage: FC = () => (
  <ThreadUserMessageRoot className="group/message relative mx-auto flex w-full max-w-3xl flex-col items-end gap-1">
    <div className="flex items-start gap-4">
      <ActionBarPrimitive.Root
        hideWhenRunning
        className={cn("mt-2", userMessageActionBarRootClass)}
      >
        <ActionBarPrimitive.Edit asChild>
          <TooltipIconButton tooltip="编辑" className="text-muted-foreground">
            <Pencil1Icon />
          </TooltipIconButton>
        </ActionBarPrimitive.Edit>
      </ActionBarPrimitive.Root>
      <div className="rounded-3xl bg-[#e6efff] px-5 py-2 text-[#0d3b8c] dark:bg-[#243044] dark:text-[#b8d4ff]">
        <MessagePrimitive.Parts />
      </div>
    </div>
    <BranchPicker className="mt-2 mr-3" />
  </ThreadUserMessageRoot>
);

const EditComposer: FC = () => (
  <ComposerPrimitive.Root className="mx-auto flex w-full max-w-3xl flex-col justify-end gap-1 rounded-3xl bg-[#e6efff] dark:bg-[#243044]">
    <ComposerPrimitive.Input className="flex min-h-8 w-full resize-none bg-transparent p-5 pb-0 text-[#0d3b8c] outline-none dark:text-[#b8d4ff]" />
    <div className="m-3 mt-2 flex items-center justify-center gap-2 self-end">
      <ComposerPrimitive.Cancel className="rounded-full bg-white px-3 py-2 font-semibold text-[#0d3b8c] text-sm hover:bg-[#f0f6ff] dark:bg-[#1a2332] dark:text-[#b8d4ff]">
        取消
      </ComposerPrimitive.Cancel>
      <ComposerPrimitive.Send className="rounded-full bg-[#1a73e8] px-3 py-2 font-semibold text-white text-sm hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:text-[#0f1419]">
        发送
      </ComposerPrimitive.Send>
    </div>
  </ComposerPrimitive.Root>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="group/message relative mx-auto flex w-full max-w-3xl flex-col">
    <div className="text-[#0d3b8c] dark:text-[#b8d4ff]">
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

const BranchPicker: FC<{ className?: string }> = ({ className }) => (
  <BranchPickerPrimitive.Root
    hideWhenSingleBranch
    className={cn(
      "inline-flex items-center font-semibold text-muted-foreground text-sm",
      className,
    )}
  >
    <BranchPickerPrimitive.Previous asChild>
      <TooltipIconButton tooltip="上一条" className="text-muted-foreground">
        <ChevronLeftIcon />
      </TooltipIconButton>
    </BranchPickerPrimitive.Previous>
    <BranchPickerPrimitive.Number />/<BranchPickerPrimitive.Count />
    <BranchPickerPrimitive.Next asChild>
      <TooltipIconButton tooltip="下一条" className="text-muted-foreground">
        <ChevronRightIcon />
      </TooltipIconButton>
    </BranchPickerPrimitive.Next>
  </BranchPickerPrimitive.Root>
);
