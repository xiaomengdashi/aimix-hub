export type ArtifactKind = "html" | "react" | "svg" | "code";

export type ArtifactPanelTab = "preview" | "code";

export type Artifact = {
  id: string;
  messageId: string;
  blockIndex: number;
  title: string;
  language: string;
  kind: ArtifactKind;
  content: string;
  updatedAt: number;
};

export type OpenArtifactInput = {
  messageId: string;
  blockIndex: number;
  language: string;
  content: string;
  title?: string;
};
