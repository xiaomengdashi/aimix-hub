import { notFound } from "next/navigation";
import { UserManagementPanel } from "@/components/auth/user-management-panel";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  if (!session) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-muted/20 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <UserManagementPanel currentUserId={session.user.id} />
      </div>
    </main>
  );
}
