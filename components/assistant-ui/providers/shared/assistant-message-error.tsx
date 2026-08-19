"use client";

import type { FC } from "react";
import { ErrorPrimitive, MessagePrimitive } from "@assistant-ui/react";
import { cn } from "@/lib/utils";

export const AssistantMessageError: FC<{ className?: string }> = ({
  className,
}) => (
  <MessagePrimitive.Error>
    <ErrorPrimitive.Root
      className={cn(
        "mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200",
        className,
      )}
    >
      <ErrorPrimitive.Message className="whitespace-pre-wrap break-words" />
    </ErrorPrimitive.Root>
  </MessagePrimitive.Error>
);
