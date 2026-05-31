import { create } from "zustand";
import {
  createArtifactId,
  defaultArtifactTitle,
  resolveArtifactKind,
  supportsArtifactPreview,
} from "@/lib/artifacts/eligibility";
import type {
  Artifact,
  ArtifactPanelTab,
  OpenArtifactInput,
} from "@/lib/artifacts/types";

type ArtifactStore = {
  artifacts: Record<string, Artifact>;
  activeId: string | null;
  panelOpen: boolean;
  panelTab: ArtifactPanelTab;
  panelWidth: number;
  openArtifact: (input: OpenArtifactInput) => void;
  closePanel: () => void;
  setActiveArtifact: (id: string) => void;
  setPanelTab: (tab: ArtifactPanelTab) => void;
  setPanelWidth: (width: number) => void;
  updateArtifactContent: (id: string, content: string) => void;
  resetArtifacts: () => void;
};

const DEFAULT_PANEL_WIDTH = 520;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 960;

export const ARTIFACT_PANEL_WIDTH = {
  default: DEFAULT_PANEL_WIDTH,
  min: MIN_PANEL_WIDTH,
  max: MAX_PANEL_WIDTH,
} as const;

export const useArtifactStore = create<ArtifactStore>((set, get) => ({
  artifacts: {},
  activeId: null,
  panelOpen: false,
  panelTab: "preview",
  panelWidth: DEFAULT_PANEL_WIDTH,

  openArtifact: (input) => {
    const kind = resolveArtifactKind(input.language, input.content);
    const id = createArtifactId(input.messageId, input.blockIndex);
    const title =
      input.title ??
      defaultArtifactTitle(input.language, kind);

    const artifact: Artifact = {
      id,
      messageId: input.messageId,
      blockIndex: input.blockIndex,
      title,
      language: input.language,
      kind,
      content: input.content,
      updatedAt: Date.now(),
    };

    set((state) => ({
      artifacts: { ...state.artifacts, [id]: artifact },
      activeId: id,
      panelOpen: true,
      panelTab: supportsArtifactPreview(kind) ? "preview" : "code",
    }));
  },

  closePanel: () => set({ panelOpen: false }),

  setActiveArtifact: (id) => {
    if (!get().artifacts[id]) return;
    const kind = get().artifacts[id]?.kind;
    set({
      activeId: id,
      panelOpen: true,
      panelTab: supportsArtifactPreview(kind) ? "preview" : "code",
    });
  },

  setPanelTab: (tab) => set({ panelTab: tab }),

  setPanelWidth: (width) =>
    set({
      panelWidth: Math.min(
        MAX_PANEL_WIDTH,
        Math.max(MIN_PANEL_WIDTH, width),
      ),
    }),

  updateArtifactContent: (id, content) => {
    const current = get().artifacts[id];
    if (!current) return;

    const kind = resolveArtifactKind(current.language, content);
    set((state) => ({
      artifacts: {
        ...state.artifacts,
        [id]: {
          ...current,
          content,
          kind,
          updatedAt: Date.now(),
        },
      },
    }));
  },

  resetArtifacts: () =>
    set({
      artifacts: {},
      activeId: null,
      panelOpen: false,
      panelTab: "preview",
    }),
}));

export function useActiveArtifact(): Artifact | null {
  return useArtifactStore((state) => {
    if (!state.activeId) return null;
    return state.artifacts[state.activeId] ?? null;
  });
}
