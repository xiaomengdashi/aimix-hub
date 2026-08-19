"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import {
	CONSOLE_NAV_GROUPS,
	isConsoleNavActive,
} from "@/components/console/console-nav";
import { cn } from "@/lib/utils";

type ConsoleSidebarProps = {
	isAdmin: boolean;
	onNavigateAction?: () => void;
};

export const ConsoleSidebar: FC<ConsoleSidebarProps> = ({
	isAdmin,
	onNavigateAction,
}) => {
	const pathname = usePathname();

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col bg-white">
			<div className="px-5 pt-5 pb-6">
				<div className="flex items-center gap-2.5">
					<span
						aria-hidden
						className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 text-[13px] font-bold text-white"
					>
						A
					</span>
					<div className="min-w-0">
						<p className="text-[15px] font-bold leading-tight tracking-tight text-slate-900">
							Axis Control
						</p>
						<p className="text-[10px] leading-tight text-slate-400">
							AI Platform
						</p>
					</div>
				</div>
			</div>

			<nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
				{CONSOLE_NAV_GROUPS.filter((group) => !group.adminOnly || isAdmin).map(
					(group) => (
						<section key={group.id}>
							<p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
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
													aria-current={active ? "page" : undefined}
													className={cn(
														"flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
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
		</div>
	);
};
