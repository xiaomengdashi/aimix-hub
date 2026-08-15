"use client";

import { ArrowLeftIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import {
	CONSOLE_NAV_GROUPS,
	isConsoleNavActive,
} from "@/components/console/console-nav";
import { useSignOut } from "@/hooks/use-sign-out";
import { APP_USER_ROLE_LABELS, type AppUserRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type ConsoleSidebarProps = {
	displayName: string;
	role: AppUserRole | null;
	isAdmin: boolean;
	onNavigateAction?: () => void;
};

export const ConsoleSidebar: FC<ConsoleSidebarProps> = ({
	displayName,
	role,
	isAdmin,
	onNavigateAction,
}) => {
	const pathname = usePathname();
	const { signOut, loading } = useSignOut();
	const roleLabel = role ? APP_USER_ROLE_LABELS[role] : null;

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="px-3 pt-4 pb-3">
				<p className="px-2 font-semibold text-[15px] tracking-tight">控制台</p>
			</div>

			<nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-3">
				{CONSOLE_NAV_GROUPS.filter((group) => !group.adminOnly || isAdmin).map(
					(group) => (
						<section key={group.id}>
							<p className="px-2 pb-1.5 font-medium text-[11px] text-muted-foreground tracking-wide">
								{group.label}
							</p>
							<ul className="space-y-0.5">
								{group.items
									.filter((item) => !item.adminOnly || isAdmin)
									.map((item) => {
										const Icon = item.icon;
										const active = isConsoleNavActive(pathname, item.href);
										return (
											<li key={item.href}>
												<Link
													href={item.href}
													onClick={onNavigateAction}
													className={cn(
														"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
														active
															? "bg-black/[0.06] font-medium text-foreground dark:bg-white/10"
															: "text-neutral-600 hover:bg-black/[0.04] hover:text-foreground dark:text-neutral-400 dark:hover:bg-white/5",
													)}
												>
													<Icon className="size-3.5 shrink-0 opacity-70" />
													{item.label}
												</Link>
											</li>
										);
									})}
							</ul>
						</section>
					),
				)}
			</nav>

			<footer className="mt-auto space-y-1 border-black/5 border-t px-3 py-3 dark:border-white/10">
				<Link
					href="/"
					onClick={onNavigateAction}
					className="flex items-center gap-2 rounded-md px-2 py-1.5 text-neutral-600 text-sm hover:bg-black/[0.04] hover:text-foreground dark:text-neutral-400 dark:hover:bg-white/5"
				>
					<ArrowLeftIcon className="size-3.5 opacity-70" />
					返回对话
				</Link>
				<button
					type="button"
					disabled={loading}
					onClick={() => void signOut()}
					className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-red-700/80 text-sm hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
				>
					<LogOutIcon className="size-3.5 opacity-70" />
					{loading ? "退出中…" : "退出登录"}
				</button>
				<div className="px-2 pt-2">
					<p className="truncate font-medium text-sm">{displayName}</p>
					{roleLabel ? (
						<p className="text-muted-foreground text-xs">{roleLabel}</p>
					) : null}
				</div>
			</footer>
		</div>
	);
};
