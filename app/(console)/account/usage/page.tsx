import { redirect } from "next/navigation";
import { AccountActivityPanel } from "@/components/console/account/activity-panel";
import { AccountOverviewCards } from "@/components/console/account/overview-cards";
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
				title="用量"
				description="会话、消息与 Token 统计，以及近 14 天活跃"
			/>
			<div className="space-y-6">
				<AccountOverviewCards overview={stats.overview} />
				<AccountUsageSection
					byProvider={stats.byProvider}
					byModel={stats.byModel}
				/>
				<AccountActivityPanel activity={stats.activity} />
			</div>
		</>
	);
}
