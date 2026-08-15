import type { LucideIcon } from "lucide-react";
import {
	ArchiveIcon,
	BarChart3Icon,
	LayoutDashboardIcon,
	RouteIcon,
	Settings2Icon,
	UserIcon,
	UsersRoundIcon,
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
		id: "overview",
		label: "总览",
		adminOnly: true,
		items: [
			{ href: "/admin", label: "控制台首页", icon: LayoutDashboardIcon, adminOnly: true },
		],
	},
	{
		id: "resources",
		label: "资源管理",
		adminOnly: true,
		items: [
			{ href: "/admin/users", label: "成员与权限", icon: UsersRoundIcon, adminOnly: true },
			{ href: "/admin/models", label: "模型与路由", icon: RouteIcon, adminOnly: true },
			{ href: "/admin/integration", label: "服务配置", icon: Settings2Icon, adminOnly: true },
		],
	},
	{
		id: "account",
		label: "个人空间",
		items: [
			{ href: "/account/usage", label: "我的用量", icon: BarChart3Icon },
			{ href: "/account/archived", label: "归档会话", icon: ArchiveIcon },
			{ href: "/account", label: "账号资料", icon: UserIcon },
		],
	},
];

export function isConsoleNavActive(pathname: string, href: string): boolean {
	if (href === "/admin") {
		return pathname === "/admin";
	}
	if (href === "/account") {
		return pathname === "/account";
	}
	return pathname === href || pathname.startsWith(`${href}/`);
}
