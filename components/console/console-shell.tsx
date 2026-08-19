"use client";

import type { FC, ReactNode } from "react";
import { SidebarShellLayout } from "@/components/assistant-ui/shell/sidebar-shell-layout";
import { ConsoleSidebar } from "@/components/console/console-sidebar";
import { APP_USER_ROLE_LABELS, type AppUserRole } from "@/lib/auth/roles";

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
	const roleLabel = role ? APP_USER_ROLE_LABELS[role] : null;
	const sidebar = ({ closeMobile }: { closeMobile: () => void }) => (
		<ConsoleSidebar isAdmin={isAdmin} onNavigateAction={closeMobile} />
	);

	return (
		<SidebarShellLayout
			sidebar={sidebar}
			displayUsername={displayName}
			roleLabel={roleLabel}
			sheetTitle="控制台导航"
			sheetDescription="切换账号与管理页面"
			shellClassName="bg-[#f6f8fb]"
			asideClassName="border-slate-200 bg-white"
			sheetContentClassName="border-slate-200 bg-white"
			mainClassName="bg-[#f6f8fb]"
		>
			<div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8 xl:px-10">
				{children}
			</div>
		</SidebarShellLayout>
	);
};
