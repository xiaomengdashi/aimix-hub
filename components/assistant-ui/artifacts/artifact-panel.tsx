"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ARTIFACT_PANEL_WIDTH,
  useActiveArtifact,
  useArtifactStore,
} from "@/lib/artifacts/artifact-store";
import { supportsArtifactPreview } from "@/lib/artifacts/eligibility";
import {
  CheckIcon,
  Code2Icon,
  CopyIcon,
  EyeIcon,
  PanelRightCloseIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useRef, useState, type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArtifactCodeEditor } from "@/components/assistant-ui/artifacts/artifact-code-editor";
import { ArtifactPreviewFrame } from "@/components/assistant-ui/artifacts/artifact-preview-frame";

function clampPanelWidth(width: number): number {
  return Math.min(
    ARTIFACT_PANEL_WIDTH.max,
    Math.max(ARTIFACT_PANEL_WIDTH.min, width),
  );
}

const ArtifactPanelBody: FC = () => {
  const artifact = useActiveArtifact();
  const panelTab = useArtifactStore((s) => s.panelTab);
  const setPanelTab = useArtifactStore((s) => s.setPanelTab);
  const updateArtifactContent = useArtifactStore((s) => s.updateArtifactContent);
  const [copied, setCopied] = useState(false);

  if (!artifact) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-muted-foreground text-sm">
        选择消息中的代码块，点击「Artifacts」打开预览。
      </div>
    );
  }

  const canPreview = supportsArtifactPreview(artifact.kind);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm">{artifact.title}</p>
          <p className="truncate text-muted-foreground text-xs">
            {artifact.language}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          aria-label="复制代码"
          onClick={() => void handleCopy()}
        >
          {copied ? (
            <CheckIcon className="size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </Button>
      </div>

      {canPreview ? (
        <div className="flex shrink-0 border-b px-3 py-1.5">
          <div className="inline-flex rounded-md bg-muted p-0.5">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors",
                panelTab === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setPanelTab("preview")}
            >
              <EyeIcon className="size-3.5" />
              预览
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors",
                panelTab === "code"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setPanelTab("code")}
            >
              <Code2Icon className="size-3.5" />
              代码
            </button>
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        {canPreview && panelTab === "preview" ? (
          <div className="h-full min-h-0 touch-pan-y">
            <ArtifactPreviewFrame
              kind={artifact.kind}
              content={artifact.content}
            />
          </div>
        ) : (
          <div className="h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-contain">
            <ArtifactCodeEditor
              value={artifact.content}
              language={artifact.language}
              onChange={(value) => updateArtifactContent(artifact.id, value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const DesktopArtifactPanel: FC = () => {
  const panelOpen = useArtifactStore((s) => s.panelOpen);
  const panelWidth = useArtifactStore((s) => s.panelWidth);
  const setPanelWidth = useArtifactStore((s) => s.setPanelWidth);
  const closePanel = useArtifactStore((s) => s.closePanel);
  const draggingRef = useRef(false);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const nextWidth = window.innerWidth - event.clientX;
      setPanelWidth(nextWidth);
    },
    [setPanelWidth],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const startResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      draggingRef.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  if (!panelOpen) return null;

  const width = clampPanelWidth(panelWidth);

  return (
    <aside
      className="absolute inset-y-0 right-0 z-20 hidden flex-col overflow-hidden border-[#E5E0D6] border-s bg-white md:flex dark:border-[#3d3a35] dark:bg-[#1f1e1b]"
      style={{ width }}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="调整 Artifacts 面板宽度"
        className="absolute top-0 left-0 z-10 h-full w-1 -translate-x-1/2 cursor-col-resize bg-transparent hover:bg-[#c96442]/20"
        onPointerDown={startResize}
      />
      <div className="flex shrink-0 items-center justify-between border-[#E5E0D6] border-b px-3 py-2 dark:border-[#3d3a35]">
        <div className="flex items-center gap-2 text-sm">
          <PanelRightCloseIcon className="size-4 text-[#c96442]" />
          <span className="font-medium">Artifacts</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="关闭 Artifacts 面板"
          onClick={closePanel}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ArtifactPanelBody />
      </div>
    </aside>
  );
};

const MobileArtifactPanel: FC = () => {
  const panelOpen = useArtifactStore((s) => s.panelOpen);
  const closePanel = useArtifactStore((s) => s.closePanel);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Sheet open={panelOpen} onOpenChange={(open) => !open && closePanel()}>
      <SheetContent
        side="right"
        className="flex w-[min(100vw,520px)] flex-col p-0"
      >
        <SheetHeader className="border-b px-4 py-3 text-left">
          <SheetTitle>Artifacts</SheetTitle>
          <SheetDescription>代码 / HTML / React 预览与编辑</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ArtifactPanelBody />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const ArtifactPanel: FC = () => (
  <>
    <DesktopArtifactPanel />
    <MobileArtifactPanel />
  </>
);

export const ArtifactWorkspace: FC<{ children: ReactNode }> = ({ children }) => {
  const panelOpen = useArtifactStore((s) => s.panelOpen);
  const panelWidth = useArtifactStore((s) => s.panelWidth);
  const reservedWidth = panelOpen ? clampPanelWidth(panelWidth) : 0;

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <div
        className="flex h-full min-h-0 flex-col overflow-hidden transition-[padding-right] duration-200 ease-out"
        style={{ paddingRight: reservedWidth }}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
      <ArtifactPanel />
    </div>
  );
};
