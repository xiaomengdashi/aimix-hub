import type { FC } from "react";
import { useId } from "react";
import type { AdminDashboardData } from "@/lib/admin/dashboard-types";
import { formatTokenCount } from "@/lib/chat/context-usage";

const VIEW_WIDTH = 680;
const VIEW_HEIGHT = 220;
const PADDING = 12;
const MESSAGE_COLOR = "#2F6FED";
const TOKEN_COLOR = "#21A7B8";

type DashboardTrendChartProps = {
	activity: AdminDashboardData["activity"];
};

function buildPoints(
	values: number[],
	max: number,
): string {
	if (values.length === 0) return "";
	const innerWidth = VIEW_WIDTH - PADDING * 2;
	const innerHeight = VIEW_HEIGHT - PADDING * 2;
	const step = values.length > 1 ? innerWidth / (values.length - 1) : 0;
	return values
		.map((value, index) => {
			const x = PADDING + step * index;
			const ratio = max > 0 ? value / max : 0;
			const y = PADDING + innerHeight - ratio * innerHeight;
			return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
		})
		.join(" ");
}

export const DashboardTrendChart: FC<DashboardTrendChartProps> = ({
	activity,
}) => {
	const gradientId = useId();
	const messageCounts = activity.map((day) => day.messageCount);
	const tokenCounts = activity.map((day) => day.tokenCount);
	const totalMessages = messageCounts.reduce((sum, n) => sum + n, 0);
	const totalTokens = tokenCounts.reduce((sum, n) => sum + n, 0);
	const max = Math.max(...messageCounts, ...tokenCounts, 1);

	const messagePath = buildPoints(messageCounts, max);
	const tokenPath = buildPoints(tokenCounts, max);
	const busiesDay = activity.reduce<AdminDashboardData["activity"][number] | null>(
		(best, day) => (!best || day.messageCount > best.messageCount ? day : best),
		null,
	);

	const ariaLabel = `14 天消息量与 token 用量趋势：共 ${totalMessages} 条消息，${formatTokenCount(totalTokens)} token`;

	return (
		<div>
			<div
				role="img"
				aria-label={ariaLabel}
				className="w-full"
			>
				<svg
					viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
					className="h-56 w-full animate-[fade-in_180ms_ease-out_both]"
					preserveAspectRatio="none"
				>
					{[0.25, 0.5, 0.75].map((ratio) => (
						<line
							key={ratio}
							x1={PADDING}
							x2={VIEW_WIDTH - PADDING}
							y1={PADDING + (VIEW_HEIGHT - PADDING * 2) * ratio}
							y2={PADDING + (VIEW_HEIGHT - PADDING * 2) * ratio}
							stroke="#eef2f7"
							strokeWidth={1}
						/>
					))}
					<defs>
						<linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
							<stop offset="0" stopColor={MESSAGE_COLOR} stopOpacity={0.16} />
							<stop offset="1" stopColor={MESSAGE_COLOR} stopOpacity={0} />
						</linearGradient>
					</defs>
					{messagePath ? (
						<path
							d={`${messagePath} L${VIEW_WIDTH - PADDING} ${VIEW_HEIGHT - PADDING} L${PADDING} ${VIEW_HEIGHT - PADDING} Z`}
							fill={`url(#${gradientId})`}
							stroke="none"
						/>
					) : null}
					{tokenPath ? (
						<path
							d={tokenPath}
							fill="none"
							stroke={TOKEN_COLOR}
							strokeWidth={2}
							strokeLinecap="round"
						/>
					) : null}
					{messagePath ? (
						<path
							d={messagePath}
							fill="none"
							stroke={MESSAGE_COLOR}
							strokeWidth={2.4}
							strokeLinecap="round"
						/>
					) : null}
				</svg>
			</div>
			<div className="mt-3 flex flex-wrap items-center justify-between gap-2">
				<div className="flex gap-4 text-xs text-slate-500">
					<span className="inline-flex items-center gap-1.5">
						<span
							className="inline-block h-2 w-2 rounded-full"
							style={{ background: MESSAGE_COLOR }}
						/>
						消息量 {totalMessages}
					</span>
					<span className="inline-flex items-center gap-1.5">
						<span
							className="inline-block h-2 w-2 rounded-full"
							style={{ background: TOKEN_COLOR }}
						/>
						Token {formatTokenCount(totalTokens)}
					</span>
				</div>
				{busiesDay && busiesDay.messageCount > 0 ? (
					<p className="sr-only">
						消息量最高的一天是 {busiesDay.date}，共 {busiesDay.messageCount} 条消息。
					</p>
				) : null}
			</div>
		</div>
	);
};
