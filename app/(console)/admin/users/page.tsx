import { notFound } from "next/navigation";
import { UserManagementPanel } from "@/components/console/admin/user-management-panel";
import { ConsolePageHeader } from "@/components/console/console-page-header";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
	const session = await requireAdmin();
	if (!session) {
		notFound();
	}

	return (
		<>
			<ConsolePageHeader
				eyebrow="资源管理"
				title="成员与权限"
				description="查看用户、分配角色或删除账号。删除后该用户的会话与消息也会一并清除。"
			/>
			<UserManagementPanel currentUserId={session.user.id} />
		</>
	);
}
