import type { User } from "@supabase/supabase-js";
import {
  CalendarDaysIcon,
  ClockIcon,
  FingerprintIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import type { FC } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  APP_USER_ROLE_LABELS,
  type AppUserRole,
} from "@/lib/auth/roles";

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

export const AccountProfileSection: FC<AccountProfileSectionProps> = ({
  user,
  displayName,
  role,
}) => {
  const initial = displayName.slice(0, 1).toUpperCase();
  const roleLabel = role ? APP_USER_ROLE_LABELS[role] : "—";

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <Avatar size="lg">
          <AvatarFallback className="text-lg">{initial}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-xl">{displayName}</h1>
          <p className="text-muted-foreground text-sm">账号概览与使用统计</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3 rounded-lg bg-muted/40 px-3 py-3">
          <UserIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <dt className="text-muted-foreground text-xs">用户名</dt>
            <dd className="truncate font-medium text-sm">{displayName}</dd>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg bg-muted/40 px-3 py-3">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <dt className="text-muted-foreground text-xs">角色</dt>
            <dd className="font-medium text-sm">{roleLabel}</dd>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg bg-muted/40 px-3 py-3">
          <FingerprintIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <dt className="text-muted-foreground text-xs">用户 ID</dt>
            <dd className="break-all font-mono text-xs">{user.id}</dd>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg bg-muted/40 px-3 py-3">
          <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <dt className="text-muted-foreground text-xs">注册时间</dt>
            <dd className="font-medium text-sm">{formatDate(user.created_at)}</dd>
            <dd className="text-muted-foreground text-xs">
              已使用 {formatRelativeDays(user.created_at)}
            </dd>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg bg-muted/40 px-3 py-3">
          <ClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <dt className="text-muted-foreground text-xs">最近登录</dt>
            <dd className="font-medium text-sm">
              {formatDate(user.last_sign_in_at)}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
};
