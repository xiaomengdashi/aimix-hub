import { buildAdminDashboardData } from "@/lib/admin/dashboard-aggregation";
import type {
	AdminDashboardData,
	DashboardMessageRow,
} from "@/lib/admin/dashboard-types";
import {
	getAdminIntegrationSettings,
	listManagedModels,
} from "@/lib/admin/model-management";
import { listManagedUsers } from "@/lib/admin/list-users";
import { parseChatMessageUsage } from "@/lib/account/parse-message-usage";
import { createClient } from "@/lib/supabase/server";

const DASHBOARD_DAYS = 14;

type ThreadProviderRow = {
	id: string;
	provider: string;
};

type MessageRow = {
	user_id: string;
	thread_id: string;
	created_at: string;
	content: unknown;
};

export async function fetchAdminDashboardStats(
	now = new Date(),
): Promise<AdminDashboardData> {
	const supabase = await createClient();

	const rangeStart = new Date(now);
	rangeStart.setHours(0, 0, 0, 0);
	rangeStart.setDate(rangeStart.getDate() - (DASHBOARD_DAYS - 1));
	const rangeEnd = new Date(now);
	rangeEnd.setHours(24, 0, 0, 0);

	const [users, threadsResult, messagesResult, models, settings] =
		await Promise.all([
			listManagedUsers(supabase),
			supabase.from("threads").select("id, provider"),
			supabase
				.from("messages")
				.select("user_id, thread_id, created_at, content")
				.gte("created_at", rangeStart.toISOString())
				.lt("created_at", rangeEnd.toISOString()),
			listManagedModels(supabase),
			getAdminIntegrationSettings(supabase),
		]);

	if (threadsResult.error) {
		throw new Error(threadsResult.error.message);
	}
	if (messagesResult.error) {
		throw new Error(messagesResult.error.message);
	}

	const threadRows = (threadsResult.data ?? []) as ThreadProviderRow[];
	const messageRows = (messagesResult.data ?? []) as MessageRow[];

	const messages: DashboardMessageRow[] = messageRows.map((row) => {
		const usage = parseChatMessageUsage(row.content);
		return {
			userId: row.user_id,
			threadId: row.thread_id,
			createdAt: row.created_at,
			usage: usage
				? { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens }
				: null,
		};
	});

	return buildAdminDashboardData({
		now,
		users,
		threads: threadRows,
		messages,
		enabledModelCount: models.filter((model) => model.enabled).length,
		integration: {
			aiBaseUrl: settings.aiBaseUrl,
			aiApiKeyConfigured: settings.aiApiKeyConfigured,
			tavilyBaseUrl: settings.tavilyBaseUrl,
			tavilyApiKeyConfigured: settings.tavilyApiKeyConfigured,
		},
	});
}
