import { redirect } from "next/navigation";
import { AccountActivityPanel } from "@/components/console/account/activity-panel";
import { AccountOverviewCards } from "@/components/console/account/overview-cards";
import { AccountRecentImagesPanel } from "@/components/console/account/recent-images-panel";
import { AccountUsageSection } from "@/components/console/account/usage-section";
import { ConsolePageHeader } from "@/components/console/console-page-header";
import { fetchUserAccountStats } from "@/lib/account/fetch-user-stats";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function AccountUsagePage() {
	const user = await requireUser();
	if (!user) {
		redirect("/login");
	}

	const stats = await fetchUserAccountStats(user.id);

	return (
		<>
			<ConsolePageHeader
				eyebrow="个人空间"
				title="我的用量"
				description="会话、消息、Token 与近 14 天趋势"
			/>
			<div className="space-y-6">
				<AccountOverviewCards overview={stats.overview} />
				<AccountUsageSection
					byProvider={stats.byProvider}
					byModel={stats.byModel}
				/>
				<AccountRecentImagesPanel />
				<AccountActivityPanel activity={stats.activity} />
			</div>
		</>
	);
}
