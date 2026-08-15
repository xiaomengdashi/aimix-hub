import type { LucideIcon } from "lucide-react";
import {
	ArchiveIcon,
	BarChart3Icon,
	BotIcon,
	CableIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";

export type ConsoleNavItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	adminOnly?: boolean;
};

export type ConsoleNavGroup = {
	id: string;
	label: string;
	adminOnly?: boolean;
	items: ConsoleNavItem[];
};

export const CONSOLE_NAV_GROUPS: ConsoleNavGroup[] = [
	{
		id: "account",
		label: "账号",
		items: [
			{ href: "/account", label: "资料", icon: UserIcon },
			{ href: "/account/usage", label: "用量", icon: BarChart3Icon },
			{ href: "/account/archived", label: "归档", icon: ArchiveIcon },
		],
	},
	{
		id: "admin",
		label: "管理",
		adminOnly: true,
		items: [
			{ href: "/admin/users", label: "用户", icon: UsersIcon, adminOnly: true },
			{
				href: "/admin/models",
				label: "模型目录",
				icon: BotIcon,
				adminOnly: true,
			},
			{
				href: "/admin/integration",
				label: "接口配置",
				icon: CableIcon,
				adminOnly: true,
			},
		],
	},
];

export function isConsoleNavActive(pathname: string, href: string): boolean {
	if (href === "/account") {
		return pathname === "/account";
	}
	return pathname === href || pathname.startsWith(`${href}/`);
}
