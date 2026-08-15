import { notFound } from "next/navigation";
import { ModelManagementPanel } from "@/components/console/admin/model-management-panel";
import { ConsolePageHeader } from "@/components/console/console-page-header";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminModelsPage() {
	const session = await requireAdmin();
	if (!session) {
		notFound();
	}

	return (
		<>
			<ConsolePageHeader
				eyebrow="资源管理"
				title="模型与路由"
				description="运行时仅展示此处启用的模型；配置保存在数据库中。"
			/>
			<ModelManagementPanel />
		</>
	);
}
