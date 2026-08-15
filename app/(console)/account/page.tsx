import { redirect } from "next/navigation";
import { AccountProfileSection } from "@/components/console/account/profile-section";
import { ConsolePageHeader } from "@/components/console/console-page-header";
import { getUserRole } from "@/lib/auth/get-user-role";
import { requireUser } from "@/lib/auth/require-user";
import { getDisplayUsername } from "@/lib/auth/username";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
	const user = await requireUser();
	if (!user) {
		redirect("/login");
	}

	const supabase = await createClient();
	const role = await getUserRole(supabase, user.id);

	return (
		<>
			<ConsolePageHeader title="资料" description="账号身份、角色与注册信息" />
			<AccountProfileSection
				user={user}
				displayName={getDisplayUsername(user)}
				role={role}
			/>
		</>
	);
}
