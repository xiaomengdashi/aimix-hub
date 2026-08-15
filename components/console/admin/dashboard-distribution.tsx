import type { FC } from "react";
import type { AdminDashboardData } from "@/lib/admin/dashboard-types";
import { getAppDisplayName } from "@/lib/chat/app-id";
import { formatTokenCount } from "@/lib/chat/context-usage";

type DashboardDistributionProps = {
	providerUsage: AdminDashboardData["providerUsage"];
};

export const DashboardDistribution: FC<DashboardDistributionProps> = ({
	providerUsage,
}) => {
	const used = providerUsage.filter((row) => row.messageCount > 0);
	const max = Math.max(...used.map((row) => row.messageCount), 1);

	if (used.length === 0) {
		return (
			<p className="py-10 text-center text-muted-foreground text-sm">
				所选周期暂无应用使用记录
			</p>
		);
	}

	return (
		<ul className="space-y-4">
			{used.map((row, index) => {
				const width = Math.max(4, Math.round((row.messageCount / max) * 100));
				return (
					<li key={row.provider} className="space-y-1.5">
						<div className="flex items-center justify-between gap-3 text-sm">
							<span className="font-medium text-slate-800">
								{getAppDisplayName(row.provider)}
							</span>
							<span className="text-muted-foreground tabular-nums">
								{row.messageCount} 消息 · {formatTokenCount(row.tokenCount)}{" "}
								Token
							</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-slate-100">
							<div
								className="h-full rounded-full bg-blue-600"
								style={{
									width: `${width}%`,
									opacity: 1 - index * 0.13,
								}}
							/>
						</div>
					</li>
				);
			})}
		</ul>
	);
};
