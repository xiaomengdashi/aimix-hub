"use client";

import type { FC } from "react";
import { ImageAppLogo } from "@/components/assistant-ui/providers/image/icon";
import { UserMenu } from "@/components/auth/user-menu";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const ImageStudioHeader: FC<{
	displayName: string;
	onToggleSidebar?: () => void;
	showSidebarToggle?: boolean;
}> = ({ displayName, onToggleSidebar, showSidebarToggle }) => {
	return (
		<header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#d4e4ff]/80 bg-white/80 px-3 backdrop-blur-md sm:gap-3 sm:px-4 dark:border-[#2a3a52] dark:bg-[#0f1419]/80">
			{showSidebarToggle ? (
				<button
					type="button"
					onClick={onToggleSidebar}
					className={cn(
						"flex size-9 shrink-0 items-center justify-center rounded-lg text-[#3d5a8c] transition-colors md:hidden",
						"hover:bg-[#e6efff] dark:text-[#8ab4f8] dark:hover:bg-[#243044]",
					)}
					aria-label="打开会话列表"
				>
					<PanelLeft className="size-4" />
				</button>
			) : null}
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

			<UserMenu className="ms-auto" displayName={displayName} />
		</header>
	);
};
