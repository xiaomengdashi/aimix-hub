"use client";

import { MenuIcon } from "lucide-react";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import { UserMenu } from "@/components/auth/user-menu";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type SidebarShellLayoutProps = {
	sidebar: ReactNode | ((helpers: { closeMobile: () => void }) => ReactNode);
	children: ReactNode;
	displayUsername?: string;
	roleLabel?: string | null;
	sheetTitle: string;
	sheetDescription: string;
	shellClassName?: string;
	asideClassName?: string;
	sheetContentClassName?: string;
	headerClassName?: string;
	mainClassName?: string;
};

/** 侧栏 + 移动端抽屉 + 顶栏，供控制台等独立工作区复用。 */
export const SidebarShellLayout: FC<SidebarShellLayoutProps> = ({
	sidebar,
	children,
	displayUsername,
	roleLabel,
	sheetTitle,
	sheetDescription,
	shellClassName,
	asideClassName,
	sheetContentClassName,
	headerClassName,
	mainClassName,
}) => {
	const isMobile = useIsMobile();
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (!isMobile) setMobileOpen(false);
	}, [isMobile]);

	const closeMobile = () => setMobileOpen(false);
	const sidebarContent =
		typeof sidebar === "function" ? sidebar({ closeMobile }) : sidebar;

	return (
		<div className={cn("flex min-h-dvh items-stretch", shellClassName)}>
			<aside
				className={cn(
					"sticky top-0 hidden h-dvh w-60 shrink-0 self-stretch border-r lg:flex lg:flex-col",
					asideClassName,
				)}
			>
				{sidebarContent}
			</aside>

			<Sheet
				open={isMobile && mobileOpen}
				onOpenChange={(open) => {
					if (isMobile) setMobileOpen(open);
				}}
			>
				<SheetContent
					side="left"
					className={cn("w-64 p-0 [&>button]:hidden", sheetContentClassName)}
				>
					<SheetHeader className="sr-only">
						<SheetTitle>{sheetTitle}</SheetTitle>
						<SheetDescription>{sheetDescription}</SheetDescription>
					</SheetHeader>
					{sidebarContent}
				</SheetContent>
			</Sheet>

			<div className="flex min-w-0 flex-1 flex-col">
				<header
					className={cn(
						"flex h-12 shrink-0 items-center gap-2 border-b border-transparent px-3 lg:h-14 lg:border-slate-200/80 lg:px-6",
						headerClassName,
					)}
				>
					<TooltipIconButton
						tooltip="打开导航"
						side="bottom"
						variant="ghost"
						size="icon-sm"
						className="lg:hidden"
						aria-label="打开导航"
						onClick={() => setMobileOpen(true)}
					>
						<MenuIcon className="size-4" />
					</TooltipIconButton>
					{displayUsername ? (
						<UserMenu
							displayName={displayUsername}
							roleLabel={roleLabel}
							className="ms-auto max-w-none"
						/>
					) : null}
				</header>
				<main className={cn("min-h-0 flex-1 overflow-y-auto", mainClassName)}>
					{children}
				</main>
			</div>
		</div>
	);
};
