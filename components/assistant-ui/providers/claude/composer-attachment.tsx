"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { useCallback, useRef, type ChangeEvent, type FC } from "react";
import { useAui } from "@assistant-ui/store";
import { ComposerAttachments } from "@/components/assistant-ui/message/attachment";

const FILE_ACCEPT =
  "image/*,.pdf,.txt,.md,.markdown,.doc,.docx,.csv,.json,.html,.xml,.ts,.tsx,.js,.jsx,.css";

export type AttachmentErrorHandler = (message: string) => void;

/** Claude 主题：隐藏 file input + 可见按钮，避免动态 input 在部分浏览器失效 */
export const ClaudeComposerAddAttachment: FC<{
  className?: string;
  onError?: AttachmentErrorHandler;
}> = ({ className, onError }) => {
  const aui = useAui();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files?.length) return;

      for (const file of Array.from(files)) {
        try {
          await aui.composer().addAttachment(file);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "无法添加附件";
          onError?.(message);
        }
      }

      event.target.value = "";
    },
    [aui, onError],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={FILE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleChange}
      />
      <button
        type="button"
        aria-label="添加附件"
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        <PlusIcon width={16} height={16} />
      </button>
    </>
  );
};

export const ClaudeComposerAttachments: FC = () => {
  return (
    <div className="aui-claude-composer-attachments -mx-1 flex w-full flex-row gap-2 overflow-x-auto empty:hidden">
      <ComposerAttachments />
    </div>
  );
};
