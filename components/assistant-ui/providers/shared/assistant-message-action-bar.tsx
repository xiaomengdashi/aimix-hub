"use client";

import {
  ActionBarMorePrimitive,
  ActionBarPrimitive,
  AuiIf,
} from "@assistant-ui/react";
import { CheckIcon, CopyIcon, ReloadIcon } from "@radix-ui/react-icons";
import {
  Copy as CopyLucideIcon,
  DownloadIcon,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";
import { VoicePlaceholderButton } from "@/components/assistant-ui/providers/shared/voice-ui-placeholder";
import {
  type ComponentProps,
  type ComponentType,
  type FC,
  type ReactNode,
} from "react";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { assistantMessageActionBarRootClass } from "@/components/assistant-ui/providers/shared/message-action-bar-styles";
import { cn } from "@/lib/utils";

export type AssistantMessageActionBarVariant =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "grok"
  | "other";

type VariantConfig = {
  buttonClass: string;
  iconClass: string;
  useTooltip: boolean;
  copyIcon: "radix" | "lucide";
  reloadIcon: "radix" | "lucide";
  labels: {
    copy: string;
    reload: string;
    more: string;
    exportMarkdown: string;
    good: string;
    bad: string;
  };
  moreContentClass: string;
  moreItemClass: string;
};

const VARIANT_CONFIG: Record<AssistantMessageActionBarVariant, VariantConfig> = {
  chatgpt: {
    buttonClass:
      "flex size-8 items-center justify-center rounded-md text-[#5d5d5d] transition-colors hover:bg-[#0d0d0d]/5 hover:text-[#0d0d0d] disabled:pointer-events-none disabled:opacity-40 dark:text-[#afafaf] dark:hover:bg-white/10 dark:hover:text-white",
    iconClass: "size-4",
    useTooltip: false,
    copyIcon: "radix",
    reloadIcon: "radix",
    labels: {
      copy: "Copy",
      reload: "Regenerate",
      more: "More",
      exportMarkdown: "Export as Markdown",
      good: "Good response",
      bad: "Bad response",
    },
    moreContentClass:
      "z-50 min-w-40 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white p-1 text-[#0d0d0d] shadow-lg dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#ececec]",
    moreItemClass:
      "flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-[#0d0d0d]/5 dark:hover:bg-white/10",
  },
  claude: {
    buttonClass:
      "flex size-8 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] disabled:pointer-events-none disabled:opacity-40 dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]",
    iconClass: "size-4",
    useTooltip: false,
    copyIcon: "radix",
    reloadIcon: "radix",
    labels: {
      copy: "Copy",
      reload: "Regenerate",
      more: "More",
      exportMarkdown: "Export as Markdown",
      good: "Good response",
      bad: "Bad response",
    },
    moreContentClass:
      "z-50 min-w-40 overflow-hidden rounded-lg border border-[#E5E0D6] bg-[#F0ECE0] p-1 text-[#1a1a18] shadow-md dark:border-[#3d3a35] dark:bg-[#2b2a27] dark:text-[#eee]",
    moreItemClass:
      "flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none hover:bg-[#1a1a18]/5 dark:hover:bg-white/5",
  },
  gemini: {
    buttonClass:
      "flex size-8 items-center justify-center rounded-full text-[#444746] transition-colors hover:bg-[#444746]/8 disabled:pointer-events-none disabled:opacity-40 dark:text-[#c4c7c5] dark:hover:bg-[#c4c7c5]/8",
    iconClass: "size-3.5",
    useTooltip: false,
    copyIcon: "lucide",
    reloadIcon: "radix",
    labels: {
      copy: "Copy",
      reload: "Regenerate",
      more: "More",
      exportMarkdown: "Export as Markdown",
      good: "Good response",
      bad: "Bad response",
    },
    moreContentClass:
      "z-50 min-w-40 overflow-hidden rounded-2xl border border-[#dadce0] bg-[#f8f9fa] p-1 text-[#1f1f1f] shadow-lg dark:border-[#3c4043] dark:bg-[#282a2c] dark:text-[#e3e3e3]",
    moreItemClass:
      "flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-sm outline-none hover:bg-[#444746]/8 dark:hover:bg-[#c4c7c5]/8",
  },
  grok: {
    buttonClass:
      "flex h-8 w-8 items-center justify-center rounded-full text-[#6b6b6b] transition-colors hover:bg-[#e5e5e5] hover:text-[#0d0d0d] disabled:pointer-events-none disabled:opacity-40 dark:text-[#9a9a9a] dark:hover:bg-[#2a2a2a] dark:hover:text-white",
    iconClass: "size-4",
    useTooltip: false,
    copyIcon: "lucide",
    reloadIcon: "lucide",
    labels: {
      copy: "Copy",
      reload: "Regenerate",
      more: "More",
      exportMarkdown: "Export as Markdown",
      good: "Good response",
      bad: "Bad response",
    },
    moreContentClass:
      "z-50 min-w-40 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white p-1 text-[#0d0d0d] shadow-lg dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white",
    moreItemClass:
      "flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a]",
  },
  other: {
    buttonClass: "aui-button-icon size-6 p-1",
    iconClass: "size-4",
    useTooltip: true,
    copyIcon: "lucide",
    reloadIcon: "lucide",
    labels: {
      copy: "复制",
      reload: "重新生成",
      more: "更多",
      exportMarkdown: "导出 Markdown",
      good: "有帮助",
      bad: "没帮助",
    },
    moreContentClass:
      "aui-action-bar-more-content z-50 min-w-36 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
    moreItemClass:
      "aui-action-bar-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
  },
};

const CopyIconVisual: FC<{
  variant: VariantConfig;
  copied: boolean;
}> = ({ variant, copied }) => {
  if (copied) {
    return <CheckIcon className={variant.copyIcon === "radix" ? undefined : variant.iconClass} />;
  }
  return variant.copyIcon === "radix" ? (
    <CopyIcon />
  ) : (
    <CopyLucideIcon className={variant.iconClass} />
  );
};

const ReloadIconVisual: FC<{ variant: VariantConfig }> = ({ variant }) =>
  variant.reloadIcon === "radix" ? (
    <ReloadIcon className={variant.iconClass} />
  ) : (
    <ReloadIcon className={variant.iconClass} />
  );

const PrimitiveActionButton: FC<{
  config: VariantConfig;
  tooltip: string;
  primitive: ComponentType<Record<string, unknown>>;
  children: ReactNode;
  className?: string;
}> = ({ config, tooltip, primitive: Primitive, children, className }) => {
  if (config.useTooltip) {
    return (
      <Primitive asChild>
        <TooltipIconButton
          tooltip={tooltip}
          className={cn(config.buttonClass, className)}
        >
          {children}
        </TooltipIconButton>
      </Primitive>
    );
  }
  return (
    <Primitive className={cn(config.buttonClass, className)} title={tooltip}>
      {children}
    </Primitive>
  );
};

const MessageActionBarMore: FC<{
  config: VariantConfig;
}> = ({ config }) => {
  const trigger = config.useTooltip ? (
    <TooltipIconButton
      tooltip={config.labels.more}
      className={cn(config.buttonClass, "data-[state=open]:bg-accent")}
    >
      <MoreHorizontal className={config.iconClass} />
    </TooltipIconButton>
  ) : (
    <button
      type="button"
      className={config.buttonClass}
      title={config.labels.more}
    >
      <MoreHorizontal className={config.iconClass} />
    </button>
  );

  return (
    <ActionBarMorePrimitive.Root>
      <ActionBarMorePrimitive.Trigger asChild>
        {trigger}
      </ActionBarMorePrimitive.Trigger>
      <ActionBarMorePrimitive.Content
        side="bottom"
        align="start"
        className={config.moreContentClass}
      >
        <ActionBarPrimitive.ExportMarkdown asChild>
          <ActionBarMorePrimitive.Item className={config.moreItemClass}>
            <DownloadIcon className={config.iconClass} />
            {config.labels.exportMarkdown}
          </ActionBarMorePrimitive.Item>
        </ActionBarPrimitive.ExportMarkdown>
      </ActionBarMorePrimitive.Content>
    </ActionBarMorePrimitive.Root>
  );
};

export const AssistantMessageActionBar: FC<
  {
    variant: AssistantMessageActionBarVariant;
  } & Pick<
    ComponentProps<typeof ActionBarPrimitive.Root>,
    "className" | "hideWhenRunning"
  >
> = ({ variant, className, hideWhenRunning, ...rootProps }) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <ActionBarPrimitive.Root
      hideWhenRunning={hideWhenRunning}
      className={cn(assistantMessageActionBarRootClass, className)}
      {...rootProps}
    >
      <PrimitiveActionButton
        config={config}
        tooltip={config.labels.copy}
        primitive={ActionBarPrimitive.Copy}
      >
        <AuiIf condition={(s) => s.message.isCopied}>
          <CopyIconVisual variant={config} copied />
        </AuiIf>
        <AuiIf condition={(s) => !s.message.isCopied}>
          <CopyIconVisual variant={config} copied={false} />
        </AuiIf>
      </PrimitiveActionButton>

      <PrimitiveActionButton
        config={config}
        tooltip={config.labels.good}
        primitive={ActionBarPrimitive.FeedbackPositive}
        className="data-[submitted=true]:text-foreground"
      >
        <AuiIf
          condition={(s) =>
            s.message.metadata.submittedFeedback?.type === "positive"
          }
        >
          <ThumbsUp className={cn(config.iconClass, "fill-current")} />
        </AuiIf>
        <AuiIf
          condition={(s) =>
            s.message.metadata.submittedFeedback?.type !== "positive"
          }
        >
          <ThumbsUp className={config.iconClass} />
        </AuiIf>
      </PrimitiveActionButton>

      <PrimitiveActionButton
        config={config}
        tooltip={config.labels.bad}
        primitive={ActionBarPrimitive.FeedbackNegative}
        className="data-[submitted=true]:text-foreground"
      >
        <AuiIf
          condition={(s) =>
            s.message.metadata.submittedFeedback?.type === "negative"
          }
        >
          <ThumbsDown className={cn(config.iconClass, "fill-current")} />
        </AuiIf>
        <AuiIf
          condition={(s) =>
            s.message.metadata.submittedFeedback?.type !== "negative"
          }
        >
          <ThumbsDown className={config.iconClass} />
        </AuiIf>
      </PrimitiveActionButton>

      {config.useTooltip ? (
        <VoicePlaceholderButton
          className={cn(config.buttonClass, "aui-button-icon size-6 p-1")}
        >
          <Volume2 className={config.iconClass} />
        </VoicePlaceholderButton>
      ) : (
        <VoicePlaceholderButton className={config.buttonClass}>
          <Volume2 className={config.iconClass} />
        </VoicePlaceholderButton>
      )}

      <PrimitiveActionButton
        config={config}
        tooltip={config.labels.reload}
        primitive={ActionBarPrimitive.Reload}
      >
        <ReloadIconVisual variant={config} />
      </PrimitiveActionButton>

      <MessageActionBarMore config={config} />
    </ActionBarPrimitive.Root>
  );
};
