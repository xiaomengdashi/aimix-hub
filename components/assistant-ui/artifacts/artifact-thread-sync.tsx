"use client";

import { useEffect, type FC } from "react";
import { useAuiState } from "@assistant-ui/store";
import { useArtifactStore } from "@/lib/artifacts/artifact-store";

export const ArtifactThreadSync: FC = () => {
  const mainThreadId = useAuiState((s) => s.threads.mainThreadId);
  const resetArtifacts = useArtifactStore((s) => s.resetArtifacts);

  useEffect(() => {
    resetArtifacts();
  }, [mainThreadId, resetArtifacts]);

  return null;
};
