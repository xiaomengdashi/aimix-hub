import { redirect } from "next/navigation";
import { AccountArchivedList } from "@/components/console/account/archived-list";
import { ConsolePageHeader } from "@/components/console/console-page-header";
import { fetchUserAccountStats } from "@/lib/account/fetch-user-stats";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function AccountArchivedPage() {
	const user = await requireUser();
	if (!user) {
		redirect("/login");
	}

	const stats = await fetchUserAccountStats(user.id);

	return (
		<>
			<ConsolePageHeader
				eyebrow="个人空间"
				title="归档会话"
				description="已归档会话会保存在云端，可随时恢复"
			/>
			<AccountArchivedList threads={stats.archivedThreads} />
		</>
	);
}
