import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function ConsoleAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await requireAdmin();
	if (!session) {
		notFound();
	}

	return children;
}
