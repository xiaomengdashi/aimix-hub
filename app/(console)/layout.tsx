import { redirect } from "next/navigation";
import { ConsoleRoot } from "@/components/console/console-root";
import { getUserRole } from "@/lib/auth/get-user-role";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { requireUser } from "@/lib/auth/require-user";
import { getDisplayUsername } from "@/lib/auth/username";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await requireUser();
	if (!user) {
		redirect("/login");
	}

	const supabase = await createClient();
	const role = await getUserRole(supabase, user.id);

	return (
		<ConsoleRoot
			displayName={getDisplayUsername(user)}
			role={role}
			isAdmin={isAdminRole(role)}
		>
			{children}
		</ConsoleRoot>
	);
}
