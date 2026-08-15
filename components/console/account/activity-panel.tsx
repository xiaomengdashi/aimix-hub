import type { FC } from "react";
import type { ActivityDayStat } from "@/lib/account/types";
import { cn } from "@/lib/utils";

type AccountActivityPanelProps = {
	activity: ActivityDayStat[];
};

function formatDayLabel(dateKey: string): string {
	const date = new Date(`${dateKey}T12:00:00`);
	return date.toLocaleDateString("zh-CN", {
		month: "numeric",
		day: "numeric",
		weekday: "short",
	});
}

export const AccountActivityPanel: FC<AccountActivityPanelProps> = ({
	activity,
}) => {
	const maxMessages = Math.max(...activity.map((day) => day.messageCount), 1);
	const totalMessages = activity.reduce(
		(sum, day) => sum + day.messageCount,
		0,
	);
	const activeDays = activity.filter((day) => day.messageCount > 0).length;

	return (
		<section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
			<div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
				<div>
					<h2 className="text-base font-semibold tracking-tight text-slate-900">
						近 14 天活跃
					</h2>
					<p className="mt-0.5 text-sm text-slate-500">按日消息量展示使用趋势</p>
				</div>
				<div className="text-end text-sm">
					<p className="font-medium tabular-nums text-slate-800">
						{totalMessages} 条消息
					</p>
					<p className="text-xs text-slate-500">{activeDays} 天有活动</p>
				</div>
			</div>

			<div
				className="grid grid-cols-7 gap-2 sm:grid-cols-14"
				role="img"
				aria-label={`近 14 天活跃：共 ${totalMessages} 条消息，${activeDays} 天有活动`}
			>
				{activity.map((day) => {
					const height =
						day.messageCount > 0
							? Math.max(12, Math.round((day.messageCount / maxMessages) * 100))
							: 4;
					const isActive = day.messageCount > 0;

					return (
						<div
							key={day.date}
							className="flex flex-col items-center gap-2"
							title={`${formatDayLabel(day.date)}：${day.messageCount} 消息 · ${day.threadCount} 会话`}
						>
							<div className="flex h-24 w-full items-end justify-center">
								<div
									className={cn(
										"w-full max-w-8 rounded-md transition-colors duration-150",
										isActive ? "bg-blue-500" : "bg-slate-100",
									)}
									style={{ height: `${height}%` }}
								/>
							</div>
							<span className="text-[10px] leading-none text-slate-400">
								{day.date.slice(5).replace("-", "/")}
							</span>
						</div>
					);
				})}
			</div>
		</section>
	);
};
