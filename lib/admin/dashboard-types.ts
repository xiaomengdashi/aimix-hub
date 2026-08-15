import type { AppId } from "@/lib/chat/app-id";

export type DashboardIntegrationStatus = {
	aiBaseUrl: string | null;
	aiApiKeyConfigured: boolean;
	tavilyBaseUrl: string | null;
	tavilyApiKeyConfigured: boolean;
};

export type DashboardMessageRow = {
	userId: string;
	threadId: string;
	createdAt: string;
	usage: { inputTokens?: number; outputTokens?: number } | null;
};

export type AdminDashboardData = {
	range: { start: string; end: string; days: 14 };
	overview: {
		totalUsers: number;
		activeUsers: number;
		messageCount: number;
		totalTokens: number;
		enabledModelCount: number;
	};
	activity: Array<{
		date: string;
		messageCount: number;
		tokenCount: number;
	}>;
	providerUsage: Array<{
		provider: AppId;
		messageCount: number;
		tokenCount: number;
	}>;
	integration: DashboardIntegrationStatus;
	attention: Array<{
		id: "missing-ai-key" | "missing-tavily-key" | "no-enabled-models";
		level: "warning";
		title: string;
		description: string;
		href: "/admin/integration" | "/admin/models";
	}>;
};
