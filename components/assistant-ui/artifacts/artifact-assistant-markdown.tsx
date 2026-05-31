"use client";

import type { FC } from "react";
import { MarkdownText } from "@/components/assistant-ui/message/markdown-text";
import { ArtifactAutoOpenSync } from "@/components/assistant-ui/artifacts/artifact-auto-open-sync";
import { ArtifactBlockIndexProvider } from "@/components/assistant-ui/artifacts/artifact-block-index";
import { ArtifactsEnabledProvider } from "@/components/assistant-ui/artifacts/artifacts-enabled-context";

/** Assistant 消息 Markdown，启用 Artifacts 按钮与自动打开。 */
export const ArtifactAssistantMarkdown: FC = () => (
  <>
    <ArtifactBlockIndexProvider>
      <ArtifactsEnabledProvider value={true}>
        <MarkdownText />
      </ArtifactsEnabledProvider>
    </ArtifactBlockIndexProvider>
    <ArtifactAutoOpenSync />
  </>
);
