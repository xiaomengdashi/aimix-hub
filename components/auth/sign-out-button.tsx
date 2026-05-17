"use client";

import type { FC, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-sign-out";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  children?: ReactNode;
};

export const SignOutButton: FC<SignOutButtonProps> = ({
  className,
  children,
}) => {
  const { signOut, loading } = useSignOut();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("text-muted-foreground", className)}
      disabled={loading}
      onClick={() => void signOut()}
    >
      {loading ? "退出中…" : (children ?? "退出登录")}
    </Button>
  );
};
