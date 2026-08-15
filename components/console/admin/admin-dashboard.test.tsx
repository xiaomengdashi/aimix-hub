import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AdminDashboard } from "./admin-dashboard";

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));

it("shows a readable loading state then renders real dashboard totals", async () => {
	vi.mocked(fetch).mockResolvedValueOnce(
		new Response(
			JSON.stringify({
				dashboard: {
					range: { start: "2026-07-31", end: "2026-08-13", days: 14 },
					overview: {
						totalUsers: 3,
						activeUsers: 2,
						messageCount: 14,
						totalTokens: 1200,
						enabledModelCount: 2,
					},
					activity: [
						{ date: "2026-08-13", messageCount: 14, tokenCount: 1200 },
					],
					providerUsage: [
						{ provider: "claude", messageCount: 14, tokenCount: 1200 },
					],
					integration: {
						aiBaseUrl: "https://gateway.example/v1",
						aiApiKeyConfigured: true,
						tavilyBaseUrl: "https://api.tavily.com",
						tavilyApiKeyConfigured: true,
					},
					attention: [],
				},
			}),
			{ status: 200 },
		),
	);

	render(<AdminDashboard />);
	expect(screen.getByText("正在加载系统统计…")).toBeInTheDocument();
	expect(await screen.findByText("3")).toBeInTheDocument();
	expect(
		screen.getByRole("img", { name: /14 天消息量与 token 用量趋势/ }),
	).toBeInTheDocument();
	expect(screen.getByText("Claude")).toBeInTheDocument();
});

it("shows an error and retries the same endpoint", async () => {
	vi.mocked(fetch)
		.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: "统计服务不可用" }), {
				status: 500,
			}),
		)
		.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					dashboard: {
						range: { start: "2026-07-31", end: "2026-08-13", days: 14 },
						overview: {
							totalUsers: 0,
							activeUsers: 0,
							messageCount: 0,
							totalTokens: 0,
							enabledModelCount: 0,
						},
						activity: [],
						providerUsage: [],
						integration: {
							aiBaseUrl: null,
							aiApiKeyConfigured: false,
							tavilyBaseUrl: null,
							tavilyApiKeyConfigured: false,
						},
						attention: [],
					},
				}),
				{ status: 200 },
			),
		);

	render(<AdminDashboard />);
	expect(await screen.findByText("统计服务不可用")).toBeInTheDocument();
	fireEvent.click(screen.getByRole("button", { name: "重试" }));
	await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
});
