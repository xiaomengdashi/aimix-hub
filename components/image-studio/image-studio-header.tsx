"use client";

import Link from "next/link";
import type { FC } from "react";
import { ImageAppLogo } from "@/components/assistant-ui/providers/image/icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import { useSignOut } from "@/hooks/use-sign-out";
import { ChevronDownIcon } from "@radix-ui/react-icons";

export const ImageStudioHeader: FC<{ displayName: string }> = ({
  displayName,
}) => {
  const initial = displayName.slice(0, 1).toUpperCase();
  const { signOut, loading } = useSignOut();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#d4e4ff]/80 bg-white/80 px-4 backdrop-blur-md dark:border-[#2a3a52] dark:bg-[#0f1419]/80">
      <div className="flex min-w-0 items-center gap-2.5">
        <ImageAppLogo variant="icon" />
        <div className="min-w-0">
          <p className="bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#0891b2] bg-clip-text font-semibold text-sm text-transparent dark:from-[#c4b5fd] dark:via-[#f9a8d4] dark:to-[#67e8f9]">
            AI 绘图工作室
          </p>
          <p className="truncate text-[#3d5a8c] text-xs dark:text-[#8ab4f8]">
            每次生成都会创建新会话
          </p>
        </div>
      </div>

      <div className="ms-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-[#e6efff] dark:hover:bg-[#243044]">
            <Avatar className="size-7">
              <AvatarFallback className="bg-[#e6efff] text-[#0d3b8c] text-xs dark:bg-[#243044] dark:text-[#b8d4ff]">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[8rem] truncate sm:inline">
              {displayName}
            </span>
            <ChevronDownIcon className="size-4 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/account">账户设置</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={loading}
              onSelect={() => void signOut()}
            >
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
