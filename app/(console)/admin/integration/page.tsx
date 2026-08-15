import { notFound } from "next/navigation";
import { IntegrationSettingsPanel } from "@/components/console/admin/integration-settings-panel";
import { ConsolePageHeader } from "@/components/console/console-page-header";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationPage() {
	const session = await requireAdmin();
	if (!session) {
		notFound();
	}

	return (
		<>
			<ConsolePageHeader
				title="接口配置"
				description="配置 AI 网关与 Tavily 的地址和密钥。"
			/>
			<IntegrationSettingsPanel />
		</>
	);
}
