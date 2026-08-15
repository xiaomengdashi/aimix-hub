import type { FC } from "react";
import { getAppDisplayName, type AppId } from "@/lib/chat/app-id";
import { formatTokenCount } from "@/lib/chat/context-usage";
import type { ModelUsageStat, ProviderUsageStat } from "@/lib/account/types";
import { cn } from "@/lib/utils";

type AccountUsageSectionProps = {
	byProvider: ProviderUsageStat[];
	byModel: ModelUsageStat[];
};

const PROVIDER_COLORS: Record<AppId, string> = {
	chatgpt: "bg-chart-1",
	claude: "bg-chart-2",
	gemini: "bg-chart-3",
	other: "bg-chart-4",
	image: "bg-chart-5",
};

function UsageBar({
	value,
	max,
	className,
}: {
	value: number;
	max: number;
	className?: string;
}) {
	const width = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
	return (
		<div className="h-2 overflow-hidden rounded-full bg-muted">
			<div
				className={cn("h-full rounded-full transition-all", className)}
				style={{ width: `${width}%` }}
			/>
		</div>
	);
}

export const AccountUsageSection: FC<AccountUsageSectionProps> = ({
	byProvider,
	byModel,
}) => {
	const maxProviderMessages = Math.max(
		...byProvider.map((item) => item.messageCount),
		1,
	);
	const maxModelCount = Math.max(
		...byModel.map((item) => item.messageCount),
		1,
	);

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<section className="rounded-xl border bg-card p-5 shadow-sm">
				<div className="mb-4">
					<h2 className="font-medium text-base">各应用使用量</h2>
					<p className="text-muted-foreground text-sm">
						按 ChatGPT、Claude、Gemini 等应用统计会话与消息
					</p>
				</div>

				{byProvider.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground text-sm">
						暂无使用记录
					</p>
				) : (
					<ul className="space-y-4">
						{byProvider.map((item) => (
							<li key={item.provider} className="space-y-2">
								<div className="flex items-center justify-between gap-3 text-sm">
									<span className="font-medium">
										{getAppDisplayName(item.provider)}
									</span>
									<span className="text-muted-foreground tabular-nums">
										{item.messageCount} 消息 · {item.threadCount} 会话
									</span>
								</div>
								<UsageBar
									value={item.messageCount}
									max={maxProviderMessages}
									className={PROVIDER_COLORS[item.provider]}
								/>
								{item.inputTokens + item.outputTokens > 0 ? (
									<p className="text-muted-foreground text-xs tabular-nums">
										Token{" "}
										{formatTokenCount(item.inputTokens + item.outputTokens)}
									</p>
								) : null}
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="rounded-xl border bg-card p-5 shadow-sm">
				<div className="mb-4">
					<h2 className="font-medium text-base">绘图模型使用量</h2>
					<p className="text-muted-foreground text-sm">
						统计 Image Studio 中各模型的生成次数
					</p>
				</div>

				{byModel.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground text-sm">
						暂无绘图记录
					</p>
				) : (
					<ul className="space-y-4">
						{byModel.map((item) => (
							<li key={item.modelId} className="space-y-2">
								<div className="flex items-center justify-between gap-3 text-sm">
									<span className="font-medium">{item.label}</span>
									<span className="text-muted-foreground tabular-nums">
										{item.messageCount} 次
									</span>
								</div>
								<UsageBar
									value={item.messageCount}
									max={maxModelCount}
									className="bg-chart-5"
								/>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
};
