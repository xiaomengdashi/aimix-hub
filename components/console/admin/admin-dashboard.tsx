"use client";

import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useState, type FC } from "react";
import type { AdminDashboardData } from "@/lib/admin/dashboard-types";
import { formatTokenCount } from "@/lib/chat/context-usage";
import { Button } from "@/components/ui/button";
import { ConsoleSection } from "@/components/console/console-section";
import { DashboardTrendChart } from "@/components/console/admin/dashboard-trend-chart";
import { DashboardDistribution } from "@/components/console/admin/dashboard-distribution";
import { DashboardStatus } from "@/components/console/admin/dashboard-status";

type DashboardState =
	| { kind: "loading" }
	| { kind: "error"; message: string }
	| { kind: "ready"; dashboard: AdminDashboardData };

async function loadDashboard(): Promise<AdminDashboardData> {
	const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
	const payload = (await response.json()) as {
		dashboard?: AdminDashboardData;
		error?: string;
	};

	if (!response.ok || !payload.dashboard) {
		throw new Error(payload.error ?? "加载控制台统计失败");
	}

	return payload.dashboard;
}

const KPI_DEFS = [
	{
		key: "totalUsers",
		label: "总用户数",
		value: (d: AdminDashboardData) => String(d.overview.totalUsers),
	},
	{
		key: "activeUsers",
		label: "14 天活跃用户",
		value: (d: AdminDashboardData) => String(d.overview.activeUsers),
	},
	{
		key: "messages",
		label: "14 天消息量",
		value: (d: AdminDashboardData) => String(d.overview.messageCount),
	},
	{
		key: "tokens",
		label: "14 天 Token 用量",
		value: (d: AdminDashboardData) => formatTokenCount(d.overview.totalTokens),
	},
] as const;

export const AdminDashboard: FC = () => {
	const [state, setState] = useState<DashboardState>({ kind: "loading" });

	const load = useCallback(async () => {
		setState({ kind: "loading" });
		try {
			const dashboard = await loadDashboard();
			setState({ kind: "ready", dashboard });
		} catch (error) {
			setState({
				kind: "error",
				message: error instanceof Error ? error.message : "加载控制台统计失败",
			});
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	if (state.kind === "loading") {
		return (
			<div className="flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-6 py-20 text-slate-500">
				<Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden />
				正在加载系统统计…
			</div>
		);
	}

	if (state.kind === "error") {
		return (
			<div
				role="alert"
				className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50/50 px-6 py-16 text-center"
			>
				<p className="text-sm text-red-700">{state.message}</p>
				<Button type="button" variant="outline" onClick={() => void load()}>
					<RefreshCwIcon className="size-4" />
					重试
				</Button>
			</div>
		);
	}

	const { dashboard } = state;

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{KPI_DEFS.map((kpi) => (
					<div
						key={kpi.key}
						aria-label={`${kpi.label}：${kpi.value(dashboard)}`}
						className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]"
					>
						<p className="text-sm text-slate-500">{kpi.label}</p>
						<p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
							{kpi.value(dashboard)}
						</p>
					</div>
				))}
			</div>

			<ConsoleSection
				title="请求与 Token 趋势"
				description={`统计范围 ${dashboard.range.start} 至 ${dashboard.range.end}`}
			>
				<DashboardTrendChart activity={dashboard.activity} />
			</ConsoleSection>

			<div className="grid gap-6 lg:grid-cols-2">
				<ConsoleSection title="应用使用分布" description="最近 14 天按应用统计消息与 Token">
					<DashboardDistribution providerUsage={dashboard.providerUsage} />
				</ConsoleSection>
				<ConsoleSection
					title="服务配置状态"
					description="密钥仅显示配置状态，不会展示内容"
					action={<span className="text-xs text-slate-400">配置状态 · 非在线状态</span>}
				>
					<DashboardStatus
						integration={dashboard.integration}
						enabledModelCount={dashboard.overview.enabledModelCount}
						attention={dashboard.attention}
					/>
				</ConsoleSection>
			</div>
		</div>
	);
};
