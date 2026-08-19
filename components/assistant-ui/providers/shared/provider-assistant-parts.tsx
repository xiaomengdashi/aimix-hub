"use client";

import type { FC } from "react";
import { MessagePrimitive } from "@assistant-ui/react";
import { ArtifactAssistantMarkdown } from "@/components/assistant-ui/artifacts/artifact-assistant-markdown";
import { AssistantFilePart } from "@/components/assistant-ui/message/assistant-file-part";
import { ToolFallback } from "@/components/assistant-ui/message/tool-fallback";

export const ProviderAssistantParts: FC = () => (
  <MessagePrimitive.Parts>
    {({ part }) => {
      if (part.type === "text") return <ArtifactAssistantMarkdown />;
      if (part.type === "tool-call")
        return part.toolUI ?? <ToolFallback {...part} />;
      if (part.type === "file") return <AssistantFilePart {...part} />;
      return null;
    }}
  </MessagePrimitive.Parts>
);
