import {
	ArchiveIcon,
	MessageSquareIcon,
	MessagesSquareIcon,
	SparklesIcon,
} from "lucide-react";
import type { FC } from "react";
import { formatTokenCount } from "@/lib/chat/context-usage";
import type { UserAccountStats } from "@/lib/account/types";

type AccountOverviewCardsProps = {
	overview: UserAccountStats["overview"];
};

const cards = [
	{
		key: "threads",
		label: "会话总数",
		icon: MessagesSquareIcon,
		getValue: (overview: UserAccountStats["overview"]) =>
			String(overview.totalThreads),
		hint: (overview: UserAccountStats["overview"]) =>
			`${overview.activeThreads} 活跃 · ${overview.pinnedThreads} 置顶`,
	},
	{
		key: "messages",
		label: "消息总数",
		icon: MessageSquareIcon,
		getValue: (overview: UserAccountStats["overview"]) =>
			String(overview.totalMessages),
		hint: (overview: UserAccountStats["overview"]) =>
			`${overview.assistantMessages} 条助手回复已统计 Token`,
	},
	{
		key: "tokens",
		label: "Token 用量",
		icon: SparklesIcon,
		getValue: (overview: UserAccountStats["overview"]) =>
			formatTokenCount(overview.inputTokens + overview.outputTokens),
		hint: (overview: UserAccountStats["overview"]) =>
			`输入 ${formatTokenCount(overview.inputTokens)} · 输出 ${formatTokenCount(overview.outputTokens)}`,
	},
	{
		key: "archived",
		label: "已归档",
		icon: ArchiveIcon,
		getValue: (overview: UserAccountStats["overview"]) =>
			String(overview.archivedThreads),
		hint: () => "可在归档页查看并恢复",
	},
] as const;

export const AccountOverviewCards: FC<AccountOverviewCardsProps> = ({
	overview,
}) => {
	return (
		<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<article
						key={card.key}
						aria-label={`${card.label}：${card.getValue(overview)}`}
						className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]"
					>
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm text-slate-500">{card.label}</p>
							<span className="grid size-8 place-items-center rounded-lg bg-blue-50">
								<Icon className="size-4 text-blue-600" aria-hidden />
							</span>
						</div>
						<p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
							{card.getValue(overview)}
						</p>
						<p className="mt-1 text-xs text-slate-500">{card.hint(overview)}</p>
					</article>
				);
			})}
		</section>
	);
};
