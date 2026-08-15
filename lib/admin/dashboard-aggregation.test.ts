import { expect, it } from "vitest";
import { buildAdminDashboardData } from "@/lib/admin/dashboard-aggregation";

const now = new Date("2026-08-13T12:00:00.000Z");

it("builds fourteen contiguous days, aggregates tokens, and de-duplicates active users", () => {
	const dashboard = buildAdminDashboardData({
		now,
		users: [{ id: "u-1" }, { id: "u-2" }, { id: "u-3" }],
		threads: [
			{ id: "t-1", provider: "claude" },
			{ id: "t-2", provider: "image" },
		],
		messages: [
			{ userId: "u-1", threadId: "t-1", createdAt: "2026-08-12T08:00:00.000Z", usage: { inputTokens: 10, outputTokens: 5 } },
			{ userId: "u-1", threadId: "t-1", createdAt: "2026-08-12T09:00:00.000Z", usage: { inputTokens: 4, outputTokens: 1 } },
			{ userId: "u-2", threadId: "t-2", createdAt: "2026-08-02T11:00:00.000Z", usage: null },
		],
		enabledModelCount: 2,
		integration: {
			aiBaseUrl: "https://gateway.example/v1",
			aiApiKeyConfigured: true,
			tavilyBaseUrl: "https://api.tavily.com",
			tavilyApiKeyConfigured: true,
		},
	});

	expect(dashboard.activity).toHaveLength(14);
	expect(dashboard.overview).toMatchObject({
		totalUsers: 3,
		activeUsers: 2,
		messageCount: 3,
		totalTokens: 20,
		enabledModelCount: 2,
	});
	expect(dashboard.activity.at(-1)).toMatchObject({ date: "2026-08-13", messageCount: 0, tokenCount: 0 });
	expect(dashboard.providerUsage.find((row) => row.provider === "claude")).toMatchObject({ messageCount: 2, tokenCount: 20 });
	expect(dashboard.attention).toEqual([]);
});

it("emits only configuration warnings and never returns secret values", () => {
	const dashboard = buildAdminDashboardData({
		now,
		users: [],
		threads: [],
		messages: [],
		enabledModelCount: 0,
		integration: {
			aiBaseUrl: "https://gateway.example/v1",
			aiApiKeyConfigured: false,
			tavilyBaseUrl: "https://api.tavily.com",
			tavilyApiKeyConfigured: false,
		},
	});

	expect(dashboard.attention.map((item) => item.id)).toEqual([
		"missing-ai-key",
		"missing-tavily-key",
		"no-enabled-models",
	]);
	expect(JSON.stringify(dashboard)).not.toContain("api-key");
});
