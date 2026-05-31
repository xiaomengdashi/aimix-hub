"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState, type ComponentProps, type FC } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

export const PasswordInput: FC<PasswordInputProps> = ({
  className,
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn(
        "flex h-9 w-full items-stretch overflow-hidden rounded-md border border-input bg-transparent shadow-xs",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        "dark:bg-input/30",
      )}
    >
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(
          "h-full min-h-0 flex-1 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent",
          className,
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        className="flex w-10 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "隐藏密码" : "显示密码"}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOffIcon className="size-4" aria-hidden />
        ) : (
          <EyeIcon className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
};
