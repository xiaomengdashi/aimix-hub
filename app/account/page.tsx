import { redirect } from "next/navigation";
import { AccountDashboard } from "@/components/auth/account-dashboard";
import { fetchUserAccountStats } from "@/lib/account/fetch-user-stats";
import { getUserRole } from "@/lib/auth/get-user-role";
import { requireUser } from "@/lib/auth/require-user";
import { getDisplayUsername } from "@/lib/auth/username";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [stats, role] = await Promise.all([
    fetchUserAccountStats(user.id),
    getUserRole(supabase, user.id),
  ]);

  return (
    <main className="min-h-dvh bg-muted/20 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <AccountDashboard
          user={user}
          displayName={getDisplayUsername(user)}
          role={role}
          stats={stats}
        />
      </div>
    </main>
  );
}
