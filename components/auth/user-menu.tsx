"use client";

import {
  ArchiveIcon,
  BotIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import { useAuiState } from "@assistant-ui/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSignOut } from "@/hooks/use-sign-out";
import { useUserIsAdmin } from "@/hooks/use-user-is-admin";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  displayName: string;
};

export const UserMenu: FC<UserMenuProps> = ({ displayName }) => {
  const initial = displayName.slice(0, 1).toUpperCase();
  const { signOut, loading } = useSignOut();
  const archivedCount = useAuiState((s) => s.threads.archivedThreadIds.length);
  const isAdmin = useUserIsAdmin();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "ms-auto flex h-9 max-w-[12rem] items-center gap-2 rounded-lg px-2",
          "text-foreground hover:bg-muted",
        )}
        aria-label="账号菜单"
      >
        <Avatar size="sm">
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 truncate font-medium text-sm">
          {displayName}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <div className="px-3 py-2">
          <p className="truncate font-medium text-sm">{displayName}</p>
          <p className="text-muted-foreground text-xs">已登录</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild icon={<UserIcon className="size-4" />}>
          <Link href="/account">个人中心</Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <>
            <DropdownMenuItem asChild icon={<UsersIcon className="size-4" />}>
              <Link href="/admin/users">用户管理</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild icon={<BotIcon className="size-4" />}>
              <Link href="/admin/models">模型管理</Link>
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuItem asChild icon={<ArchiveIcon className="size-4" />}>
          <Link href="/account#archived">
            已归档
            {archivedCount > 0 ? (
              <span className="ms-auto text-muted-foreground text-xs tabular-nums">
                {archivedCount}
              </span>
            ) : null}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={<LogOutIcon className="size-4" />}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          disabled={loading}
          onSelect={(event) => {
            event.preventDefault();
            void signOut();
          }}
        >
          {loading ? "退出中…" : "退出登录"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
