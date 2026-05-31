"use client";

import { ArrowLeftIcon, BotIcon, LogOutIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { FC } from "react";
import { AccountActivityPanel } from "@/components/auth/account-activity-panel";
import { AccountArchivedList } from "@/components/auth/account-archived-list";
import { AccountOverviewCards } from "@/components/auth/account-overview-cards";
import { AccountProfileSection } from "@/components/auth/account-profile-section";
import { AccountUsageSection } from "@/components/auth/account-usage-section";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-sign-out";
import type { UserAccountStats } from "@/lib/account/types";
import type { AppUserRole } from "@/lib/auth/roles";
import { isAdminRole } from "@/lib/auth/is-admin-role";

type AccountDashboardProps = {
  user: User;
  displayName: string;
  role: AppUserRole | null;
  stats: UserAccountStats;
};

export const AccountDashboard: FC<AccountDashboardProps> = ({
  user,
  displayName,
  role,
  stats,
}) => {
  const { signOut, loading } = useSignOut();
  const isAdmin = isAdminRole(role);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ms-2 gap-1.5" asChild>
          <Link href="/">
            <ArrowLeftIcon className="size-4" />
            返回对话
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link href="/admin/models">
                  <BotIcon className="size-4" />
                  模型管理
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link href="/admin/users">
                  <UsersIcon className="size-4" />
                  用户管理
                </Link>
              </Button>
            </>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            disabled={loading}
            onClick={() => void signOut()}
          >
            <LogOutIcon className="size-4" />
            {loading ? "退出中…" : "退出登录"}
          </Button>
        </div>
      </header>

      <AccountProfileSection
        user={user}
        displayName={displayName}
        role={role}
      />
      <AccountOverviewCards overview={stats.overview} />
      <AccountUsageSection
        byProvider={stats.byProvider}
        byModel={stats.byModel}
      />
      <AccountActivityPanel activity={stats.activity} />
      <AccountArchivedList threads={stats.archivedThreads} />
    </div>
  );
};
