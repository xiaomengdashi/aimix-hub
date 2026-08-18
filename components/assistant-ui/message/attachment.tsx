"use client";

import {
  type PropsWithChildren,
  useEffect,
  useState,
  type FC,
} from "react";
import { ExternalLink, Loader2, PlusIcon, XIcon, FileText } from "lucide-react";
import {
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAuiState,
  useAui,
} from "@assistant-ui/react";
import { useShallow } from "zustand/shallow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import {
  type AttachmentPreview,
  resolveAttachmentPreview,
} from "@/lib/attachments/preview";
import { ImagePreviewDialog } from "@/components/assistant-ui/message/image-preview-dialog";
import { cn } from "@/lib/utils";

const TEXT_PREVIEW_MAX_CHARS = 512_000;

const useFileSrc = (file: File | undefined) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setSrc(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return src;
};

const useAttachmentSrc = () => {
  const { file, src } = useAuiState(
    useShallow((s): { file?: File; src?: string } => {
      if (s.attachment.type !== "image") return {};
      if (s.attachment.file) return { file: s.attachment.file };
      const src = s.attachment.content?.filter((c) => c.type === "image")[0]
        ?.image;
      if (!src) return {};
      return { src };
    }),
  );

  return useFileSrc(file) ?? src;
};

const useAttachmentSnapshot = () =>
  useAuiState(
    useShallow((s) => ({
      id: s.attachment.id,
      type: s.attachment.type,
      name: s.attachment.name,
      content: s.attachment.content,
      file: s.attachment.file,
      contentType: s.attachment.contentType,
    })),
  );

type PreviewLoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; preview: AttachmentPreview }
  | { status: "error"; message: string };

const AttachmentImagePreview: FC<{ src: string }> = ({ src }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <img
      src={src}
      alt="Attachment preview"
      className={cn(
        "block h-auto max-h-[96dvh] w-auto max-w-[96vw] object-contain",
        isLoaded
          ? "aui-attachment-preview-image-loaded"
          : "aui-attachment-preview-image-loading invisible",
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

const AttachmentPreviewBody: FC<{ preview: AttachmentPreview }> = ({
  preview,
}) => {
  switch (preview.kind) {
    case "image":
      return (
        <div className="aui-attachment-preview relative mx-auto flex max-h-[96dvh] w-full items-center justify-center overflow-hidden bg-background">
          <AttachmentImagePreview src={preview.src} />
        </div>
      );
    case "text":
      return (
        <div className="aui-attachment-preview-text flex max-h-[80dvh] min-h-[12rem] flex-col gap-2">
          {preview.truncated ? (
            <p className="text-muted-foreground text-xs">
              文件较大，仅显示前 {TEXT_PREVIEW_MAX_CHARS.toLocaleString()} 个字符。
            </p>
          ) : null}
          <pre className="min-h-0 flex-1 overflow-auto rounded-md border bg-muted/40 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {preview.text}
          </pre>
        </div>
      );
    case "pdf":
      return (
        <iframe
          title={preview.filename}
          src={preview.src}
          className="aui-attachment-preview-pdf h-[80dvh] w-full rounded-md border bg-muted/20"
        />
      );
    case "binary":
      return (
        <div className="aui-attachment-preview-binary flex flex-col items-center gap-4 py-10 text-center">
          <FileText className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            无法在应用内预览此文件类型（{preview.mimeType || "未知类型"}）
          </p>
          <Button asChild variant="outline" size="sm">
            <a href={preview.src} download={preview.filename} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              在新标签页打开 / 下载
            </a>
          </Button>
        </div>
      );
  }
};

const AttachmentPreviewDialog: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const attachment = useAttachmentSnapshot();
  const [loadState, setLoadState] = useState<PreviewLoadState>({
    status: "idle",
  });

  useEffect(() => {
    if (!open) {
      setLoadState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setLoadState({ status: "loading" });

    resolveAttachmentPreview(attachment)
      .then((preview) => {
        if (!cancelled) setLoadState({ status: "ready", preview });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message:
              error instanceof Error ? error.message : "无法加载附件预览",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, attachment]);

  const dialogTitle =
    loadState.status === "ready"
      ? loadState.preview.filename
      : attachment.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="aui-attachment-preview-trigger cursor-pointer transition-colors hover:bg-accent/50"
        asChild
      >
        {children}
      </DialogTrigger>
      <DialogContent className="aui-attachment-preview-dialog-content flex max-h-[90dvh] flex-col gap-3 p-4 sm:max-w-3xl [&>button]:rounded-full [&>button]:bg-foreground/60 [&>button]:p-1 [&>button]:opacity-100 [&>button]:ring-0! [&_svg]:text-background [&>button]:hover:[&_svg]:text-destructive">
        <DialogTitle className="aui-attachment-preview-title truncate pe-8 text-base font-medium">
          {dialogTitle}
        </DialogTitle>
        {loadState.status === "loading" ? (
          <div className="flex min-h-[12rem] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : null}
        {loadState.status === "error" ? (
          <p className="py-8 text-center text-destructive text-sm">
            {loadState.message}
          </p>
        ) : null}
        {loadState.status === "ready" ? (
          <AttachmentPreviewBody preview={loadState.preview} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const AttachmentThumb: FC = () => {
  const src = useAttachmentSrc();

  return (
    <Avatar className="aui-attachment-tile-avatar h-full w-full rounded-none">
      <AvatarImage
        src={src}
        alt="Attachment preview"
        className="aui-attachment-tile-image object-cover"
      />
      <AvatarFallback>
        <FileText className="aui-attachment-tile-fallback-icon size-8 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
};

const AttachmentUI: FC = () => {
  const aui = useAui();
  const isComposer = aui.attachment.source !== "message";
  const src = useAttachmentSrc();
  const name = useAuiState((s) => s.attachment.name);

  const isImage = useAuiState((s) => s.attachment.type === "image");
  const typeLabel = useAuiState((s) => {
    const type = s.attachment.type;
    switch (type) {
      case "image":
        return "Image";
      case "document":
        return "Document";
      case "file":
        return "File";
      default:
        return type;
    }
  });

  const tile = (
    <TooltipTrigger asChild>
      <div
        className="aui-attachment-tile size-14 cursor-zoom-in overflow-hidden rounded-[calc(var(--composer-radius)-var(--composer-padding))] border bg-muted transition-opacity hover:opacity-75"
        role="button"
        tabIndex={0}
        aria-label={`${typeLabel} attachment，点击预览`}
      >
        <AttachmentThumb />
      </div>
    </TooltipTrigger>
  );

  return (
    <Tooltip>
      <AttachmentPrimitive.Root
        className={cn(
          "aui-attachment-root relative",
          isImage && "aui-attachment-root-composer only:*:first:size-24",
        )}
      >
        {isImage && src ? (
          <ImagePreviewDialog src={src} alt={name} title={name}>
            {tile}
          </ImagePreviewDialog>
        ) : (
          <AttachmentPreviewDialog>{tile}</AttachmentPreviewDialog>
        )}
        {isComposer && <AttachmentRemove />}
      </AttachmentPrimitive.Root>
      <TooltipContent side="top">
        <AttachmentPrimitive.Name />
      </TooltipContent>
    </Tooltip>
  );
};

const AttachmentRemove: FC = () => {
  return (
    <AttachmentPrimitive.Remove asChild>
      <TooltipIconButton
        tooltip="Remove file"
        className="aui-attachment-tile-remove absolute end-1.5 top-1.5 size-3.5 rounded-full bg-white text-muted-foreground opacity-100 shadow-sm hover:bg-white! [&_svg]:text-black hover:[&_svg]:text-destructive"
        side="top"
      >
        <XIcon className="aui-attachment-remove-icon size-3 dark:stroke-[2.5px]" />
      </TooltipIconButton>
    </AttachmentPrimitive.Remove>
  );
};

export const UserMessageAttachments: FC = () => {
  return (
    <div className="aui-user-message-attachments-end col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2">
      <MessagePrimitive.Attachments>
        {() => <AttachmentUI />}
      </MessagePrimitive.Attachments>
    </div>
  );
};

export const ComposerAttachments: FC = () => {
  return (
    <div className="aui-composer-attachments flex w-full flex-row items-center gap-2 overflow-x-auto empty:hidden">
      <ComposerPrimitive.Attachments>
        {() => <AttachmentUI />}
      </ComposerPrimitive.Attachments>
    </div>
  );
};

export const ComposerAddAttachment: FC = () => {
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <TooltipIconButton
        tooltip="Add Attachment"
        side="bottom"
        variant="ghost"
        size="icon"
        className="aui-composer-add-attachment size-8 rounded-full p-1 font-semibold text-xs hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30"
        aria-label="Add Attachment"
      >
        <PlusIcon className="aui-attachment-add-icon size-5 stroke-[1.5px]" />
      </TooltipIconButton>
    </ComposerPrimitive.AddAttachment>
  );
};
