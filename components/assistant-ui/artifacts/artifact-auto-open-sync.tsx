"use client";

import { useEffect, useRef, type FC } from "react";
import { useAuiState } from "@assistant-ui/store";
import {
  effectiveArtifactLanguage,
  isArtifactEligible,
  resolveArtifactKind,
} from "@/lib/artifacts/eligibility";
import { useArtifactStore } from "@/lib/artifacts/artifact-store";

const CODE_FENCE_PATTERN = /```([^\n`]*)\n([\s\S]*?)```/g;

function extractEligibleBlocks(text: string): Array<{
  blockIndex: number;
  language: string;
  content: string;
}> {
  const blocks: Array<{ blockIndex: number; language: string; content: string }> =
    [];
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = CODE_FENCE_PATTERN.exec(text)) !== null) {
    const language = match[1]?.trim() ?? "";
    const content = match[2]?.trimEnd() ?? "";
    if (isArtifactEligible(language || undefined, content)) {
      blocks.push({
        blockIndex,
        language: effectiveArtifactLanguage(language, content),
        content,
      });
    }
    blockIndex += 1;
  }

  return blocks;
}

export const ArtifactAutoOpenSync: FC = () => {
  const messageId = useAuiState((s) => s.message.id);
  const role = useAuiState((s) => s.message.role);
  const isRunning = useAuiState((s) => s.message.status?.type === "running");
  const text = useAuiState((s) =>
    s.message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("\n"),
  );
  const openArtifact = useArtifactStore((s) => s.openArtifact);
  const panelOpen = useArtifactStore((s) => s.panelOpen);
  const lastOpenedRef = useRef<string | null>(null);

  useEffect(() => {
    if (role !== "assistant" || isRunning || !text.trim()) return;

    const blocks = extractEligibleBlocks(text);
    if (blocks.length !== 1) return;

    const block = blocks[0];
    const kind = resolveArtifactKind(block.language, block.content);
    if (kind !== "html" && kind !== "react") return;
    const minLength = kind === "html" ? 40 : 120;
    if (block.content.length < minLength) return;

    const key = `${messageId}:${block.blockIndex}:${block.content.length}`;
    if (lastOpenedRef.current === key) return;
    if (panelOpen) return;

    lastOpenedRef.current = key;
    openArtifact({
      messageId,
      blockIndex: block.blockIndex,
      language: block.language,
      content: block.content,
    });
  }, [role, isRunning, text, messageId, openArtifact, panelOpen]);

  return null;
};
