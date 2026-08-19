"use client";

import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/message/attachment";
import { ArtifactAssistantMarkdown } from "@/components/assistant-ui/artifacts/artifact-assistant-markdown";
import { AssistantFilePart } from "@/components/assistant-ui/message/assistant-file-part";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/message/reasoning";
import {
  ToolGroupContent,
  ToolGroupRoot,
  ToolGroupTrigger,
} from "@/components/assistant-ui/message/tool-group";
import { ToolFallback } from "@/components/assistant-ui/message/tool-fallback";
import { ContextUsageIndicator } from "@/components/assistant-ui/shell/context-usage-indicator";
import { ThreadUserMessageRoot } from "@/components/assistant-ui/shell/thread-user-message-root";
import { useChatSession } from "@/components/assistant-ui/contexts/chat-session-context";
import { useComposerTool } from "@/components/assistant-ui/contexts/composer-tool-context";
import { ComposerToolsMenu } from "@/components/assistant-ui/providers/shared/composer-tools-menu";
import { AssistantMessageError } from "@/components/assistant-ui/providers/shared/assistant-message-error";
import { OTHER_TOOLS_MENU } from "@/components/assistant-ui/providers/shared/composer-tools-menu-items";
import { ModelPicker } from "@/components/assistant-ui/model-picker";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
  type AssistantState,
  BranchPickerPrimitive,
  ComposerPrimitive,
  groupPartByType,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartColumnIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudSunIcon,
  CodeXmlIcon,
  CopyIcon,
  DownloadIcon,
  LightbulbIcon,
  MicIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PencilLineIcon,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react";
import { useState, type FC, type ReactNode } from "react";

const isNewChatView = (s: AssistantState) =>
  s.thread.messages.length === 0 &&
  (!s.thread.isLoading || s.threads.isLoading);

const isHistoryLoadingView = (s: AssistantState) =>
  s.thread.messages.length === 0 &&
  s.thread.isLoading &&
  !s.thread.isDisabled &&
  !s.threads.isLoading;

export const OtherThread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root @container flex h-full min-h-0 flex-col overflow-hidden bg-background"
      style={{
        ["--thread-max-width" as string]: "44rem",
        ["--composer-bg" as string]: "var(--color-card)",
        ["--composer-radius" as string]: "1.5rem",
        ["--composer-padding" as string]: "8px",
      }}
    >
      <AuiIf condition={isNewChatView}>
        <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 pt-4">
          <ThreadWelcome />
          <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-col gap-4 pb-4 md:pb-6">
            <Composer />
            <div className="aui-thread-welcome-suggestions-shell min-h-19">
              <AuiIf condition={(s) => s.composer.isEmpty}>
                <ThreadSuggestions />
              </AuiIf>
            </div>
            <ContextUsageIndicator
              variant="shadcn"
              className="justify-center px-(--composer-padding) md:hidden"
            />
          </div>
        </div>
      </AuiIf>

      <AuiIf condition={(s) => !isNewChatView(s)}>
        <ThreadPrimitive.Viewport
          turnAnchor="top"
          data-slot="aui_thread-viewport"
          className="relative flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4"
        >
          <AuiIf condition={isHistoryLoadingView}>
            <ThreadHistorySkeleton />
          </AuiIf>

          <div
            data-slot="aui_message-group"
            className="mb-6 flex flex-col gap-y-6 empty:hidden"
          >
            <ThreadPrimitive.Messages>
              {({ message }) => {
                if (message.composer.isEditing) return <EditComposer />;
                if (message.role === "user") return <UserMessage />;
                return <AssistantMessage />;
              }}
            </ThreadPrimitive.Messages>
          </div>

          <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto flex justify-center overflow-visible bg-background pb-2">
            <ThreadScrollToBottom />
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>

        <div className="mx-auto w-full max-w-(--thread-max-width) shrink-0 px-4 pb-4 md:pb-6">
          <Composer />
          <ContextUsageIndicator
            variant="shadcn"
            className="mt-3 justify-center px-(--composer-padding) md:hidden"
          />
        </div>
      </AuiIf>
    </ThreadPrimitive.Root>
  );
};

const ThreadHistorySkeleton: FC = () => (
  <div
    data-slot="aui_thread-history-skeleton"
    role="status"
    className="mx-auto flex w-full max-w-(--thread-max-width) flex-col gap-y-6 fade-in animate-in fill-mode-both [animation-delay:150ms] [animation-duration:200ms]"
  >
    <span className="sr-only">Loading conversation</span>
    <Skeleton className="ml-auto h-9 w-2/5 rounded-xl motion-reduce:animate-none" />
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-4 w-11/12 motion-reduce:animate-none" />
      <Skeleton className="h-4 w-4/5 motion-reduce:animate-none" />
      <Skeleton className="h-4 w-3/5 motion-reduce:animate-none" />
    </div>
    <Skeleton className="ml-auto h-9 w-1/3 rounded-xl motion-reduce:animate-none" />
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-4 w-10/12 motion-reduce:animate-none" />
      <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
    </div>
  </div>
);

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:border-border dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root mx-auto mb-6 flex w-full max-w-(--thread-max-width) flex-col items-center px-4 text-center">
      <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-2xl font-medium tracking-tight duration-200">
        How can I help you today?
      </h1>
    </div>
  );
};

type SuggestionGroup = {
  label: string;
  icon: ReactNode;
  options: { label: string; prompt: string }[];
};

const SUGGESTION_GROUPS: SuggestionGroup[] = [
  {
    label: "Weather",
    icon: <CloudSunIcon />,
    options: [
      {
        label: "in San Francisco",
        prompt: "What's the weather in San Francisco?",
      },
      { label: "in Singapore", prompt: "What's the weather in Singapore?" },
      { label: "in Tokyo", prompt: "What's the weather in Tokyo?" },
      { label: "in London", prompt: "What's the weather in London?" },
    ],
  },
  {
    label: "Code",
    icon: <CodeXmlIcon />,
    options: [
      {
        label: "explain React hooks",
        prompt: "Explain React hooks like useState and useEffect",
      },
      {
        label: "write a debounce function",
        prompt: "Write a debounce function in TypeScript",
      },
      {
        label: "review a useEffect cleanup",
        prompt: "Show me the right way to clean up a subscription in useEffect",
      },
    ],
  },
  {
    label: "Write",
    icon: <PencilLineIcon />,
    options: [
      {
        label: "a birthday card message",
        prompt:
          "Help me write a birthday card message for a friend in the notepad",
      },
      {
        label: "a product announcement",
        prompt: "Draft a short product announcement for a new dark mode",
      },
      {
        label: "release notes",
        prompt:
          "Write release notes for a bugfix release of a React component library",
      },
    ],
  },
  {
    label: "Analyze",
    icon: <ChartColumnIcon />,
    options: [
      {
        label: "React vs Vue vs Svelte",
        prompt: "Compare React, Vue, and Svelte in a table",
      },
      {
        label: "GDP of US, China, Japan",
        prompt:
          "Compare the GDP of the United States, China, and Japan in a table",
      },
      {
        label: "pros and cons of SSR",
        prompt: "What are the pros and cons of server-side rendering?",
      },
    ],
  },
  {
    label: "Brainstorm",
    icon: <LightbulbIcon />,
    options: [
      {
        label: "side project ideas",
        prompt: "Brainstorm five side project ideas for a React developer",
      },
      {
        label: "names for a dev tool",
        prompt: "Brainstorm names for a developer tools startup",
      },
      {
        label: "talk topics",
        prompt: "Brainstorm talk topics for a React meetup",
      },
    ],
  },
];

const suggestionChipClass =
  "aui-thread-welcome-suggestion text-foreground hover:bg-muted border-border/60 h-auto gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-normal whitespace-nowrap transition-colors [&_svg]:size-4";

const ThreadSuggestions: FC = () => {
  const aui = useAui();
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);
  const expandedGroup = SUGGESTION_GROUPS.find(
    (group) => group.label === expandedLabel,
  );

  const sendPrompt = (prompt: string) => {
    if (aui.thread.getState().isRunning) return;
    aui.thread.append({
      content: [{ type: "text", text: prompt }],
      runConfig: aui.composer.getState().runConfig,
    });
  };

  return (
    <div className="aui-thread-welcome-suggestions flex w-full flex-col gap-2 px-4">
      <div className="w-full overflow-x-auto scrollbar-none">
        <div className="mx-auto flex w-max items-center gap-2">
          {SUGGESTION_GROUPS.map((group) => (
            <Button
              key={group.label}
              variant="ghost"
              className={cn(
                suggestionChipClass,
                group.label === expandedLabel && "bg-muted",
              )}
              onClick={() =>
                setExpandedLabel(
                  group.label === expandedLabel ? null : group.label,
                )
              }
            >
              {group.icon}
              {group.label}
            </Button>
          ))}
        </div>
      </div>
      {expandedGroup && (
        <div
          key={expandedGroup.label}
          className="w-full overflow-x-auto fade-in slide-in-from-top-1 animate-in scrollbar-none duration-200"
        >
          <div className="mx-auto flex w-max items-center gap-2">
            {expandedGroup.options.map((option) => (
              <Button
                key={option.label}
                variant="ghost"
                className={suggestionChipClass}
                onClick={() => sendPrompt(option.prompt)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Composer: FC = () => {
  const { onComposerSubmit } = useChatSession();
  const { composerPlaceholder, integrationNote } = useComposerTool();

  return (
    <div className="flex w-full flex-col gap-1">
      <ComposerPrimitive.Root
        className="aui-composer-root relative flex w-full flex-col"
        onSubmit={onComposerSubmit}
      >
        <ComposerPrimitive.AttachmentDropzone asChild>
          <div
            data-slot="aui_composer-shell"
            className="flex w-full cursor-text flex-col gap-2 rounded-(--composer-radius) border border-border/60 bg-(--composer-bg) p-(--composer-padding) transition-[border-color] focus-within:border-border data-[dragging=true]:border-dashed data-[dragging=true]:border-ring data-[dragging=true]:bg-[color-mix(in_oklab,var(--color-accent)_50%,var(--color-background))] dark:border-muted-foreground/15 dark:focus-within:border-muted-foreground/30"
          >
            <ComposerAttachments />
            <ComposerPrimitive.Input
              placeholder={composerPlaceholder ?? "Send a message..."}
              className="aui-composer-input max-h-48 min-h-10 w-full resize-none bg-transparent px-2.5 py-1 text-base leading-6 outline-none placeholder:text-muted-foreground/60"
              rows={1}
              autoFocus
              aria-label="Message input"
            />
            <ComposerAction />
          </div>
        </ComposerPrimitive.AttachmentDropzone>
      </ComposerPrimitive.Root>
      {integrationNote ? (
        <p className="px-(--composer-padding) text-center text-muted-foreground text-xs">
          {integrationNote}
        </p>
      ) : null}
    </div>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper relative flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-1">
        <ComposerAddAttachment />
        <ModelPicker className="h-7 rounded-full" />
        <ComposerToolsMenu
          variant="other"
          tools={OTHER_TOOLS_MENU}
          align="start"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <AuiIf condition={(s) => s.thread.capabilities.dictation}>
          <AuiIf condition={(s) => s.composer.dictation == null}>
            <ComposerPrimitive.Dictate asChild>
              <TooltipIconButton
                tooltip="Voice input"
                side="bottom"
                type="button"
                variant="ghost"
                size="icon"
                className="aui-composer-dictate size-7 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Start voice input"
              >
                <MicIcon className="aui-composer-dictate-icon size-4" />
              </TooltipIconButton>
            </ComposerPrimitive.Dictate>
          </AuiIf>
          <AuiIf condition={(s) => s.composer.dictation != null}>
            <ComposerPrimitive.StopDictation asChild>
              <TooltipIconButton
                tooltip="Stop dictation"
                side="bottom"
                type="button"
                variant="ghost"
                size="icon"
                className="aui-composer-stop-dictation size-7 rounded-full text-destructive"
                aria-label="Stop voice input"
              >
                <SquareIcon className="aui-composer-stop-dictation-icon size-3.5 animate-pulse fill-current" />
              </TooltipIconButton>
            </ComposerPrimitive.StopDictation>
          </AuiIf>
        </AuiIf>
        <AuiIf condition={(s) => !s.thread.isRunning}>
          <ComposerPrimitive.Send asChild>
            <TooltipIconButton
              tooltip="Send message"
              side="bottom"
              type="button"
              variant="default"
              size="icon"
              className="aui-composer-send size-7 rounded-full"
              aria-label="Send message"
            >
              <ArrowUpIcon className="aui-composer-send-icon size-4" />
            </TooltipIconButton>
          </ComposerPrimitive.Send>
        </AuiIf>
        <AuiIf condition={(s) => s.thread.isRunning}>
          <ComposerPrimitive.Cancel asChild>
            <Button
              type="button"
              variant="default"
              size="icon"
              className="aui-composer-cancel size-7 rounded-full"
              aria-label="Stop generating"
            >
              <SquareIcon className="aui-composer-cancel-icon size-3.5 fill-current" />
            </Button>
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </div>
    </div>
  );
};

const AssistantWorkingIndicator: FC = () => {
  const isEmpty = useAuiState((s) => s.message.content.length === 0);
  if (isEmpty) {
    return (
      <span
        data-slot="aui_assistant-message-indicator"
        className="inline-flex items-center gap-2 align-middle text-muted-foreground"
      >
        <span className="size-2 animate-pulse rounded-full bg-current" />
        <span className="text-sm">Connecting</span>
      </span>
    );
  }
  return (
    <span
      data-slot="aui_assistant-message-indicator"
      className="animate-pulse font-sans"
      aria-label="Assistant is working"
    >
      {"●"}
    </span>
  );
};

const AssistantMessage: FC = () => {
  const ACTION_BAR_PT = "pt-1.5";
  const ACTION_BAR_HEIGHT = `-mb-7.5 min-h-7.5 ${ACTION_BAR_PT}`;

  return (
    <MessagePrimitive.Root
      data-slot="aui_assistant-message-root"
      data-role="assistant"
      className="relative mx-auto w-full max-w-(--thread-max-width) fade-in slide-in-from-bottom-1 animate-in duration-150"
    >
      <div
        data-slot="aui_assistant-message-content"
        className="wrap-break-word px-2 text-foreground leading-relaxed"
      >
        <MessagePrimitive.GroupedParts
          groupBy={groupPartByType({
            reasoning: ["group-chainOfThought", "group-reasoning"],
            "tool-call": ["group-chainOfThought", "group-tool"],
            "standalone-tool-call": [],
          })}
        >
          {({ part, children }) => {
            switch (part.type) {
              case "group-chainOfThought":
                return <div data-slot="aui_chain-of-thought">{children}</div>;
              case "group-tool":
                return (
                  <ToolGroupRoot variant="ghost">
                    <ToolGroupTrigger
                      count={part.indices.length}
                      active={part.status.type === "running"}
                    />
                    <ToolGroupContent>{children}</ToolGroupContent>
                  </ToolGroupRoot>
                );
              case "group-reasoning": {
                const running = part.status.type === "running";
                return (
                  <ReasoningRoot defaultOpen={running}>
                    <ReasoningTrigger active={running} />
                    <ReasoningContent aria-busy={running}>
                      <ReasoningText>{children}</ReasoningText>
                    </ReasoningContent>
                  </ReasoningRoot>
                );
              }
              case "text":
                return <ArtifactAssistantMarkdown />;
              case "reasoning":
                return <Reasoning {...part} />;
              case "tool-call":
                return part.toolUI ?? <ToolFallback {...part} />;
              case "file":
                return <AssistantFilePart {...part} />;
              case "indicator":
                return <AssistantWorkingIndicator />;
              case "data":
                return part.dataRendererUI;
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
        <AssistantMessageError />
      </div>

      <div
        data-slot="aui_assistant-message-footer"
        className={cn("ml-2 flex items-center", ACTION_BAR_HEIGHT)}
      >
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground fade-in animate-in duration-200"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AuiIf condition={(s) => s.message.isCopied}>
            <CheckIcon className="zoom-in-50 fade-in animate-in duration-200 ease-out" />
          </AuiIf>
          <AuiIf condition={(s) => !s.message.isCopied}>
            <CopyIcon className="zoom-in-75 fade-in animate-in duration-150" />
          </AuiIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
      <ActionBarMorePrimitive.Root>
        <ActionBarMorePrimitive.Trigger asChild>
          <TooltipIconButton
            tooltip="More"
            className="data-[state=open]:bg-accent"
          >
            <MoreHorizontalIcon />
          </TooltipIconButton>
        </ActionBarMorePrimitive.Trigger>
        <ActionBarMorePrimitive.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="aui-action-bar-more-content z-50 min-w-[8rem] overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground"
        >
          <ActionBarPrimitive.ExportMarkdown asChild>
            <ActionBarMorePrimitive.Item className="aui-action-bar-more-item flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              <DownloadIcon className="size-4" />
              Export as Markdown
            </ActionBarMorePrimitive.Item>
          </ActionBarPrimitive.ExportMarkdown>
        </ActionBarMorePrimitive.Content>
      </ActionBarMorePrimitive.Root>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <ThreadUserMessageRoot
      data-slot="aui_user-message-root"
      className="mx-auto grid w-full max-w-(--thread-max-width) auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 fade-in slide-in-from-bottom-1 animate-in duration-150 [&:where(>*)]:col-start-2"
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content peer wrap-break-word rounded-xl bg-muted px-4 py-2 text-foreground empty:hidden">
          <MessagePrimitive.Parts />
        </div>
        <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2 peer-empty:hidden">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker
        data-slot="aui_user-branch-picker"
        className="col-span-full col-start-1 row-start-3 -mr-1 justify-end"
      />
    </ThreadUserMessageRoot>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_edit-composer-wrapper"
      className="mx-auto flex w-full max-w-(--thread-max-width) flex-col px-2"
      data-role="user"
    >
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-[85%] cursor-text flex-col rounded-(--composer-radius) border border-border/60 bg-(--composer-bg) dark:border-muted-foreground/15">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent px-4 pt-3 pb-1 text-base text-foreground outline-none"
          autoFocus
          aria-label="Edit message"
        />
        <div className="aui-edit-composer-footer mx-2.5 mb-2.5 flex items-center gap-1.5 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="h-8 rounded-full px-3.5"
            >
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" type="button" className="h-8 rounded-full px-3.5">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-muted-foreground text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
