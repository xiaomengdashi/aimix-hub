import {
	AlertTriangleIcon,
	ArrowRightIcon,
	CheckCircle2Icon,
	CircleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import type { AdminDashboardData } from "@/lib/admin/dashboard-types";
import { cn } from "@/lib/utils";

type DashboardStatusProps = {
	integration: AdminDashboardData["integration"];
	enabledModelCount: number;
	attention: AdminDashboardData["attention"];
};

type StatusRowProps = {
	label: string;
	detail: string | null;
	ok: boolean;
};

const StatusRow: FC<StatusRowProps> = ({ label, detail, ok }) => (
	<div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
		{ok ? (
			<CheckCircle2Icon className="size-4 shrink-0 text-emerald-600" />
		) : (
			<CircleAlertIcon className="size-4 shrink-0 text-amber-500" />
		)}
		<span className="font-medium text-slate-800 text-sm">{label}</span>
		<span
			className={cn(
				"ml-auto text-sm",
				ok ? "text-muted-foreground" : "font-medium text-amber-600",
			)}
		>
			{ok ? (detail ?? "已配置") : "需配置"}
		</span>
	</div>
);

export const DashboardStatus: FC<DashboardStatusProps> = ({
	integration,
	enabledModelCount,
	attention,
}) => (
	<div>
		<div aria-label="服务配置状态">
			<StatusRow
				label="AI 网关"
				ok={integration.aiApiKeyConfigured}
				detail={integration.aiApiKeyConfigured ? integration.aiBaseUrl : null}
			/>
			<StatusRow
				label="联网搜索（Tavily）"
				ok={integration.tavilyApiKeyConfigured}
				detail={
					integration.tavilyApiKeyConfigured ? integration.tavilyBaseUrl : null
				}
			/>
			<StatusRow
				label="已启用模型"
				ok={enabledModelCount > 0}
				detail={enabledModelCount > 0 ? `${enabledModelCount} 个` : null}
			/>
		</div>

		{attention.length > 0 ? (
			<div className="mt-4 space-y-2">
				{attention.map((item) => (
					<Link
						key={item.id}
						href={item.href}
						className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100"
					>
						<AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
						<div className="min-w-0">
							<p className="font-medium text-amber-900 text-sm">{item.title}</p>
							<p className="mt-0.5 text-amber-800/80 text-xs">
								{item.description}
							</p>
						</div>
						<ArrowRightIcon className="mt-0.5 ml-auto size-4 shrink-0 text-amber-500" />
					</Link>
				))}
			</div>
		) : null}
	</div>
);
