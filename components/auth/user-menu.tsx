"use client";

import { ChevronDownIcon, LayoutDashboardIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
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
	roleLabel?: string | null;
	className?: string;
};

export const UserMenu: FC<UserMenuProps> = ({
	displayName,
	roleLabel,
	className,
}) => {
	const initial = displayName.slice(0, 1).toUpperCase();
	const { signOut, loading } = useSignOut();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"flex min-h-9 max-w-[12rem] items-center gap-2 rounded-lg px-2 py-1",
					"text-foreground hover:bg-muted",
					className,
				)}
				aria-label="账号菜单"
			>
				<Avatar size="sm">
					<AvatarFallback className="text-xs">{initial}</AvatarFallback>
				</Avatar>
				<span className="min-w-0 text-left">
					<span className="block truncate font-medium text-sm leading-tight">
						{displayName}
					</span>
					{roleLabel ? (
						<span className="block truncate text-[11px] leading-tight text-muted-foreground">
							{roleLabel}
						</span>
					) : null}
				</span>
				<ChevronDownIcon className="size-4 shrink-0 opacity-60" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-52">
				<div className="px-3 py-2">
					<p className="truncate font-medium text-sm">{displayName}</p>
					<p className="text-muted-foreground text-xs">
						{roleLabel ?? "已登录"}
					</p>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					asChild
					icon={<LayoutDashboardIcon className="size-4" />}
				>
					<Link href="/account">控制台</Link>
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
