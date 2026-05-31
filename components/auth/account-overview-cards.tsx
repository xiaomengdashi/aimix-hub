import {
  ArchiveIcon,
  MessageSquareIcon,
  MessagesSquareIcon,
  PinIcon,
  SparklesIcon,
} from "lucide-react";
import type { FC } from "react";
import { formatTokenCount } from "@/lib/chat/context-usage";
import type { UserAccountStats } from "@/lib/account/types";
import { cn } from "@/lib/utils";

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
    hint: () => "可在下方查看并恢复",
  },
] as const;

export const AccountOverviewCards: FC<AccountOverviewCardsProps> = ({
  overview,
}) => {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.key}
            className={cn(
              "rounded-xl border bg-card p-4 shadow-sm",
              card.key === "archived" && overview.archivedThreads > 0 && "border-dashed",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-sm">{card.label}</p>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 font-semibold text-2xl tabular-nums tracking-tight">
              {card.getValue(overview)}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">{card.hint(overview)}</p>
            {card.key === "threads" && overview.pinnedThreads > 0 ? (
              <p className="mt-2 inline-flex items-center gap-1 text-muted-foreground text-xs">
                <PinIcon className="size-3" />
                {overview.pinnedThreads} 个置顶会话
              </p>
            ) : null}
          </article>
        );
      })}
    </section>
  );
};
