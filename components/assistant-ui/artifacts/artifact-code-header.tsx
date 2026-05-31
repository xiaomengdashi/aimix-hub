"use client";

import type { CodeHeaderProps } from "@assistant-ui/react-markdown";
import { useAuiState } from "@assistant-ui/store";
import { ExternalLinkIcon } from "lucide-react";
import { type FC } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { useArtifactBlockIndex } from "@/components/assistant-ui/artifacts/artifact-block-index";
import {
  effectiveArtifactLanguage,
  isArtifactEligible,
} from "@/lib/artifacts/eligibility";
import { useArtifactStore } from "@/lib/artifacts/artifact-store";
import { cn } from "@/lib/utils";

function isDisplayableCodeLanguage(language: string | undefined): language is string {
  const value = language?.trim().toLowerCase();
  return Boolean(value && value !== "unknown");
}

const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number;
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

export const ArtifactCodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  const messageId = useAuiState((s) => s.message.id);
  const blockIndex = useArtifactBlockIndex();
  const openArtifact = useArtifactStore((s) => s.openArtifact);
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const showLanguage = isDisplayableCodeLanguage(language);
  const eligible = isArtifactEligible(language, code);

  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  const onOpenArtifact = () => {
    if (!code) return;
    openArtifact({
      messageId,
      blockIndex,
      language: effectiveArtifactLanguage(language, code),
      content: code,
    });
  };

  return (
    <div
      className={cn(
        "aui-code-header-root mt-2.5 flex items-center rounded-t-lg border border-border/50 border-b-0 bg-muted/50 px-3 py-1.5 text-xs",
        showLanguage || eligible ? "justify-between" : "justify-end",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {showLanguage ? (
          <span className="aui-code-header-language font-medium text-muted-foreground lowercase">
            {language}
          </span>
        ) : null}
        {eligible ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[#c96442] transition-colors hover:bg-[#c96442]/10"
            onClick={onOpenArtifact}
          >
            <ExternalLinkIcon className="size-3.5" />
            Artifacts
          </button>
        ) : null}
      </div>
      <TooltipIconButton tooltip="Copy" onClick={onCopy}>
        {!isCopied && <CopyIcon />}
        {isCopied && <CheckIcon />}
      </TooltipIconButton>
    </div>
  );
};
