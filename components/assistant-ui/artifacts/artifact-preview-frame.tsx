"use client";

import { useMemo, type FC } from "react";
import { buildArtifactPreviewDocument } from "@/lib/artifacts/preview-document";
import type { ArtifactKind } from "@/lib/artifacts/types";

type ArtifactPreviewFrameProps = {
  kind: ArtifactKind;
  content: string;
};

export const ArtifactPreviewFrame: FC<ArtifactPreviewFrameProps> = ({
  kind,
  content,
}) => {
  const srcDoc = useMemo(() => {
    if (kind === "code") return null;
    return buildArtifactPreviewDocument(kind, content);
  }, [kind, content]);

  if (!srcDoc) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-muted-foreground text-sm">
        此类型暂不支持预览，请切换到代码视图编辑。
      </div>
    );
  }

  return (
    <iframe
      title="Artifact preview"
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      className="block h-full min-h-0 w-full border-0 bg-white"
      srcDoc={srcDoc}
    />
  );
};
