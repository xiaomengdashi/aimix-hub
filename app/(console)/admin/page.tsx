import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/console/admin/admin-dashboard";
import { ConsolePageHeader } from "@/components/console/console-page-header";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
	const session = await requireAdmin();
	if (!session) {
		notFound();
	}

	return (
		<>
			<ConsolePageHeader
				eyebrow="总览"
				title="系统概览"
				description="最近 14 天的平台使用、模型配置与服务状态。"
			/>
			<AdminDashboard />
		</>
	);
}
