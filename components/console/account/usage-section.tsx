import type { FC } from "react";
import { getAppDisplayName, type AppId } from "@/lib/chat/app-id";
import { formatTokenCount } from "@/lib/chat/context-usage";
import type { ModelUsageStat, ProviderUsageStat } from "@/lib/account/types";
import { cn } from "@/lib/utils";

type AccountUsageSectionProps = {
	byProvider: ProviderUsageStat[];
	byModel: ModelUsageStat[];
};

const PROVIDER_BAR_CLASS: Record<AppId, string> = {
	chatgpt: "bg-blue-600",
	claude: "bg-blue-500",
	gemini: "bg-cyan-500",
	grok: "bg-zinc-800",
	other: "bg-slate-400",
	image: "bg-indigo-400",
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
		<div className="h-2 overflow-hidden rounded-full bg-slate-100">
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
		<div className="grid gap-6 lg:grid-cols-2">
			<section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
				<div className="mb-4 border-b border-slate-100 pb-4">
					<h2 className="font-semibold text-base text-slate-900">
						各应用使用量
					</h2>
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
									<span className="font-medium text-slate-800">
										{getAppDisplayName(item.provider)}
									</span>
									<span className="text-muted-foreground tabular-nums">
										{item.messageCount} 消息 · {item.threadCount} 会话
									</span>
								</div>
								<UsageBar
									value={item.messageCount}
									max={maxProviderMessages}
									className={PROVIDER_BAR_CLASS[item.provider]}
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

			<section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
				<div className="mb-4 border-b border-slate-100 pb-4">
					<h2 className="font-semibold text-base text-slate-900">
						绘图模型使用量
					</h2>
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
									<span className="font-medium text-slate-800">
										{item.label}
									</span>
									<span className="text-muted-foreground tabular-nums">
										{item.messageCount} 次
									</span>
								</div>
								<UsageBar
									value={item.messageCount}
									max={maxModelCount}
									className="bg-indigo-400"
								/>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
};
