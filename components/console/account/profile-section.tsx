import type { User } from "@supabase/supabase-js";
import {
	CalendarDaysIcon,
	ClockIcon,
	FingerprintIcon,
	ShieldCheckIcon,
	UserIcon,
} from "lucide-react";
import type { FC } from "react";
import { APP_USER_ROLE_LABELS, type AppUserRole } from "@/lib/auth/roles";

type AccountProfileSectionProps = {
	user: User;
	displayName: string;
	role: AppUserRole | null;
};

function formatDate(iso: string | undefined): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleString("zh-CN", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

function formatRelativeDays(iso: string | undefined): string {
	if (!iso) return "—";
	const created = new Date(iso);
	const now = new Date();
	const diffMs = now.getTime() - created.getTime();
	const days = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
	if (days === 0) return "今天";
	if (days < 30) return `${days} 天`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months} 个月`;
	const years = Math.floor(months / 12);
	return `${years} 年`;
}

type ProfileFieldProps = {
	icon: typeof UserIcon;
	label: string;
	children: React.ReactNode;
};

const ProfileField: FC<ProfileFieldProps> = ({ icon: Icon, label, children }) => (
	<div className="flex gap-3 border-b border-slate-100 px-1 py-3.5 last:border-0">
		<Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
		<div className="min-w-0">
			<dt className="text-slate-400 text-xs">{label}</dt>
			<dd className="mt-0.5 font-medium text-slate-800 text-sm">{children}</dd>
		</div>
	</div>
);

export const AccountProfileSection: FC<AccountProfileSectionProps> = ({
	user,
	displayName,
	role,
}) => {
	const initial = displayName.slice(0, 1).toUpperCase();
	const roleLabel = role ? APP_USER_ROLE_LABELS[role] : "—";

	return (
		<section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
			<div className="flex items-center gap-4 border-b border-slate-100 pb-5">
				<span
					aria-hidden
					className="grid size-14 shrink-0 place-items-center rounded-full bg-slate-900 text-lg font-semibold text-white"
				>
					{initial}
				</span>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-xl text-slate-900">{displayName}</p>
					<p className="text-slate-500 text-sm">{roleLabel}</p>
				</div>
			</div>

			<dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
				<ProfileField icon={UserIcon} label="用户名">
					<span className="block truncate">{displayName}</span>
				</ProfileField>
				<ProfileField icon={ShieldCheckIcon} label="角色">
					{roleLabel}
				</ProfileField>
				<ProfileField icon={FingerprintIcon} label="用户 ID">
					<span className="block font-mono text-xs break-all">{user.id}</span>
				</ProfileField>
				<ProfileField icon={CalendarDaysIcon} label="注册时间">
					{formatDate(user.created_at)}
					<span className="block text-slate-400 text-xs">
						已使用 {formatRelativeDays(user.created_at)}
					</span>
				</ProfileField>
				<ProfileField icon={ClockIcon} label="最近登录">
					{formatDate(user.last_sign_in_at)}
				</ProfileField>
			</dl>
		</section>
	);
};
