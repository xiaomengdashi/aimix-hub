"use client";

import { ArchivedThreadsDialog } from "@/components/assistant-ui/archived-threads-dialog";
import { ChevronDownIcon, LogOutIcon, UserIcon, ArchiveIcon } from "lucide-react";
import Link from "next/link";
import { useState, type FC } from "react";
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
import { cn } from "@/lib/utils";

type UserMenuProps = {
  displayName: string;
};

export const UserMenu: FC<UserMenuProps> = ({ displayName }) => {
  const initial = displayName.slice(0, 1).toUpperCase();
  const { signOut, loading } = useSignOut();
  const [archivedOpen, setArchivedOpen] = useState(false);
  const archivedCount = useAuiState((s) => s.threads.archivedThreadIds.length);

  return (
    <>
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
        <DropdownMenuItem
          icon={<ArchiveIcon className="size-4" />}
          onSelect={(event) => {
            event.preventDefault();
            setArchivedOpen(true);
          }}
        >
          已归档
          {archivedCount > 0 ? (
            <span className="ms-auto text-muted-foreground text-xs tabular-nums">
              {archivedCount}
            </span>
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem asChild icon={<UserIcon className="size-4" />}>
          <Link href="/account">个人信息</Link>
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
    <ArchivedThreadsDialog open={archivedOpen} onOpenChange={setArchivedOpen} />
    </>
  );
};
