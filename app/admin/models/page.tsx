import { notFound } from "next/navigation";
import { ModelManagementPanel } from "@/components/auth/model-management-panel";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminModelsPage() {
  const session = await requireAdmin();
  if (!session) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-muted/20 px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <ModelManagementPanel />
      </div>
    </main>
  );
}
