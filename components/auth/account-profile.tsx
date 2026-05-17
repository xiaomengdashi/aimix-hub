import type { User } from "@supabase/supabase-js";
import type { FC } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type AccountProfileProps = {
  user: User;
  displayName: string;
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const AccountProfile: FC<AccountProfileProps> = ({
  user,
  displayName,
}) => {
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <AvatarFallback className="text-lg">{initial}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-semibold text-xl">个人信息</h1>
          <p className="text-muted-foreground text-sm">查看与管理你的账号</p>
        </div>
      </div>

      <dl className="space-y-4 text-sm">
        <div className="space-y-1">
          <dt className="text-muted-foreground">用户名</dt>
          <dd className="font-medium">{displayName}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground">用户 ID</dt>
          <dd className="break-all font-mono text-xs">{user.id}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground">注册时间</dt>
          <dd>{formatDate(user.created_at)}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground">最近登录</dt>
          <dd>{formatDate(user.last_sign_in_at)}</dd>
        </div>
      </dl>
    </div>
  );
};
