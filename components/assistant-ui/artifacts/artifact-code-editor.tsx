"use client";

import { type FC } from "react";
import { cn } from "@/lib/utils";

type ArtifactCodeEditorProps = {
  value: string;
  language: string;
  onChange: (value: string) => void;
  className?: string;
};

export const ArtifactCodeEditor: FC<ArtifactCodeEditorProps> = ({
  value,
  language,
  onChange,
  className,
}) => {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="shrink-0 border-b px-3 py-1.5 text-muted-foreground text-xs uppercase">
        {language || "code"}
      </div>
      <textarea
        value={value}
        spellCheck={false}
        aria-label="Artifact source code"
        className="min-h-[240px] w-full flex-1 resize-none overflow-y-auto bg-[#1e1e1e] p-4 font-mono text-[#d4d4d4] text-xs leading-relaxed outline-none"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
