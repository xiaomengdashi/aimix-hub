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
	const initial = displayName.slice(0, 1).toUpperCase();

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex items-center gap-2.5 px-5 pt-6 pb-7">
				<span
					aria-hidden
					className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 text-sm font-bold text-white"
				>
					A
				</span>
				<div className="min-w-0">
					<p className="font-bold text-[15px] text-slate-900 tracking-tight">
						Axis Control
					</p>
					<p className="text-[11px] text-slate-400">AI Platform</p>
				</div>
			</div>

			<nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
				{CONSOLE_NAV_GROUPS.filter((group) => !group.adminOnly || isAdmin).map(
					(group) => (
						<section key={group.id}>
							<p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
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
														"flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
														active
															? "bg-blue-50 font-medium text-blue-700"
															: "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
													)}
												>
													<Icon
														className={cn(
															"size-4 shrink-0",
															active ? "text-blue-600" : "text-slate-400",
														)}
													/>
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

			<footer className="mt-auto space-y-1 border-t border-slate-100 px-3 py-4">
				<Link
					href="/"
					onClick={onNavigateAction}
					className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-600 text-sm transition-colors hover:bg-slate-50 hover:text-slate-950"
				>
					<ArrowLeftIcon className="size-4 text-slate-400" />
					返回对话
				</Link>
				<button
					type="button"
					disabled={loading}
					onClick={() => void signOut()}
					className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
				>
					<LogOutIcon className="size-4 text-red-400" />
					{loading ? "退出中…" : "退出登录"}
				</button>
				<div className="flex items-center gap-2.5 px-3 pt-3">
					<span
						aria-hidden
						className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white"
					>
						{initial}
					</span>
					<div className="min-w-0">
						<p className="truncate font-medium text-slate-800 text-sm">
							{displayName}
						</p>
						{roleLabel ? (
							<p className="text-[11px] text-slate-400">{roleLabel}</p>
						) : null}
					</div>
				</div>
			</footer>
		</div>
	);
};
