"use client";

import { MenuIcon } from "lucide-react";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { ConsoleSidebar } from "@/components/console/console-sidebar";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AppUserRole } from "@/lib/auth/roles";

type ConsoleShellProps = {
	displayName: string;
	role: AppUserRole | null;
	isAdmin: boolean;
	children: ReactNode;
};

export const ConsoleShell: FC<ConsoleShellProps> = ({
	displayName,
	role,
	isAdmin,
	children,
}) => {
	const isMobile = useIsMobile();
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (!isMobile) setMobileOpen(false);
	}, [isMobile]);

	const sidebar = (
		<ConsoleSidebar
			displayName={displayName}
			role={role}
			isAdmin={isAdmin}
			onNavigateAction={() => setMobileOpen(false)}
		/>
	);

	return (
		<div className="flex min-h-dvh bg-[#f6f8fb]">
			<aside className="hidden h-dvh w-60 shrink-0 border-slate-200 border-r bg-white md:flex md:sticky md:top-0">
				{sidebar}
			</aside>

			<Sheet
				open={isMobile && mobileOpen}
				onOpenChange={(open) => {
					if (isMobile) setMobileOpen(open);
				}}
			>
				<SheetContent
					side="left"
					className="w-64 border-slate-200 bg-white p-0 [&>button]:hidden"
				>
					<SheetHeader className="sr-only">
						<SheetTitle>控制台导航</SheetTitle>
						<SheetDescription>切换账号与管理页面</SheetDescription>
					</SheetHeader>
					{sidebar}
				</SheetContent>
			</Sheet>

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex h-12 shrink-0 items-center border-slate-200 border-b bg-white px-3 md:hidden">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="打开导航"
						onClick={() => setMobileOpen(true)}
					>
						<MenuIcon className="size-4" />
					</Button>
					<span className="ml-2 font-semibold text-slate-900 text-sm">
						Axis Control
					</span>
				</div>
				<main className="min-h-0 flex-1">
					<div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8 xl:px-10">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
};
