"use client";

import { createContext, useContext } from "react";

const ArtifactsEnabledContext = createContext(false);

export const ArtifactsEnabledProvider = ArtifactsEnabledContext.Provider;

export function useArtifactsEnabled(): boolean {
  return useContext(ArtifactsEnabledContext);
}
