import { APP_NAV_OPTIONS, isAppId, type AppId } from "@/lib/chat/app-id";
import type {
	AdminDashboardData,
	DashboardIntegrationStatus,
	DashboardMessageRow,
} from "@/lib/admin/dashboard-types";

const DASHBOARD_DAYS = 14;

type DayBucket = { date: string; messageCount: number; tokenCount: number };

function formatDayKey(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function buildDayBuckets(now: Date): Map<string, DayBucket> {
	const buckets = new Map<string, DayBucket>();
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);

	for (let offset = DASHBOARD_DAYS - 1; offset >= 0; offset -= 1) {
		const date = new Date(today);
		date.setDate(today.getDate() - offset);
		const key = formatDayKey(date);
		buckets.set(key, { date: key, messageCount: 0, tokenCount: 0 });
	}

	return buckets;
}

function resolveProvider(value: string | undefined): AppId {
	return value && isAppId(value) ? value : "other";
}

function messageTokens(usage: DashboardMessageRow["usage"]): number {
	if (!usage) return 0;
	return (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
}

export function buildAdminDashboardData(input: {
	now: Date;
	users: Array<{ id: string }>;
	threads: Array<{ id: string; provider: string }>;
	messages: DashboardMessageRow[];
	enabledModelCount: number;
	integration: DashboardIntegrationStatus;
}): AdminDashboardData {
	const { now, users, threads, messages, enabledModelCount, integration } =
		input;

	const dayBuckets = buildDayBuckets(now);
	const firstDay = new Date(now);
	firstDay.setHours(0, 0, 0, 0);
	firstDay.setDate(firstDay.getDate() - (DASHBOARD_DAYS - 1));
	const rangeStart = firstDay.getTime();
	const rangeEndExclusive = rangeStart + DASHBOARD_DAYS * 24 * 60 * 60 * 1000;

	const threadById = new Map(threads.map((thread) => [thread.id, thread]));

	const providerStats = new Map<
		AppId,
		{ messageCount: number; tokenCount: number }
	>(
		APP_NAV_OPTIONS.map((option) => [
			option.id,
			{ messageCount: 0, tokenCount: 0 },
		]),
	);

	const activeUserIds = new Set<string>();
	let messageCount = 0;
	let totalTokens = 0;

	for (const message of messages) {
		const createdAt = new Date(message.createdAt).getTime();
		if (createdAt < rangeStart || createdAt >= rangeEndExclusive) continue;

		const dayKey = formatDayKey(new Date(message.createdAt));
		const bucket = dayBuckets.get(dayKey);
		const tokens = messageTokens(message.usage);

		if (bucket) {
			bucket.messageCount += 1;
			bucket.tokenCount += tokens;
		}

		messageCount += 1;
		totalTokens += tokens;
		activeUserIds.add(message.userId);

		const provider = resolveProvider(
			threadById.get(message.threadId)?.provider,
		);
		const providerStat = providerStats.get(provider);
		if (providerStat) {
			providerStat.messageCount += 1;
			providerStat.tokenCount += tokens;
		}
	}

	const providerUsage = APP_NAV_OPTIONS.map((option) => {
		const stat = providerStats.get(option.id);
		return stat
			? { provider: option.id, ...stat }
			: { provider: option.id, messageCount: 0, tokenCount: 0 };
	});

	const attention: AdminDashboardData["attention"] = [];
	if (!integration.aiApiKeyConfigured) {
		attention.push({
			id: "missing-ai-key",
			level: "warning",
			title: "AI 网关密钥未配置",
			description: "配置 AI 网关的 API Key 后，对话与绘图模型才能正常调用。",
			href: "/admin/integration",
		});
	}
	if (!integration.tavilyApiKeyConfigured) {
		attention.push({
			id: "missing-tavily-key",
			level: "warning",
			title: "联网搜索密钥未配置",
			description: "配置 Tavily API Key 后，对话中的联网搜索才能使用。",
			href: "/admin/integration",
		});
	}
	if (enabledModelCount === 0) {
		attention.push({
			id: "no-enabled-models",
			level: "warning",
			title: "没有启用的模型",
			description: "在模型与路由中启用至少一个模型，运行时才会展示可选模型。",
			href: "/admin/models",
		});
	}

	const activity = [...dayBuckets.values()].map((bucket) => ({ ...bucket }));

	return {
		range: {
			start: formatDayKey(firstDay),
			end: formatDayKey(new Date(rangeEndExclusive - 1)),
			days: DASHBOARD_DAYS,
		},
		overview: {
			totalUsers: users.length,
			activeUsers: activeUserIds.size,
			messageCount,
			totalTokens,
			enabledModelCount,
		},
		activity,
		providerUsage,
		integration,
		attention,
	};
}
