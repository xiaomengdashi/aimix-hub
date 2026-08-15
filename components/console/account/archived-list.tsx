"use client";

import { ArchiveRestoreIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import { Button } from "@/components/ui/button";
import { getAppDisplayName } from "@/lib/chat/app-id";
import { threadPath } from "@/lib/chat/routes";
import { createClient } from "@/lib/supabase/client";
import type { ArchivedThreadSummary } from "@/lib/account/types";

type AccountArchivedListProps = {
	threads: ArchivedThreadSummary[];
};

function formatDate(iso: string): string {
	return new Date(iso).toLocaleString("zh-CN", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

export const AccountArchivedList: FC<AccountArchivedListProps> = ({
	threads,
}) => {
	const router = useRouter();
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [localThreads, setLocalThreads] = useState(threads);

	const handleUnarchive = async (threadId: string) => {
		setPendingId(threadId);
		try {
			const supabase = createClient();
			const { error } = await supabase
				.from("threads")
				.update({ is_archived: false })
				.eq("id", threadId);
			if (error) throw error;
			setLocalThreads((current) =>
				current.filter((thread) => thread.id !== threadId),
			);
			router.refresh();
		} finally {
			setPendingId(null);
		}
	};

	return (
		<section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
			{localThreads.length === 0 ? (
				<p className="px-5 py-12 text-center text-sm text-slate-500">
					暂无已归档会话
				</p>
			) : (
				<ul className="divide-y divide-slate-100">
					{localThreads.map((thread) => (
						<li
							key={thread.id}
							className="flex flex-col gap-3 px-5 py-4 transition-colors duration-150 hover:bg-slate-50/70 sm:flex-row sm:items-center"
						>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium text-slate-800">
									{thread.title?.trim() || "未命名会话"}
								</p>
								<p className="mt-1 text-xs text-slate-500">
									{getAppDisplayName(thread.provider)} · 最后活跃{" "}
									{formatDate(thread.lastMessageAt)}
								</p>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								<Button variant="outline" size="sm" asChild>
									<Link href={threadPath(thread.provider, thread.id)}>
										<ExternalLinkIcon className="size-3.5" />
										打开
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="gap-1.5"
									disabled={pendingId === thread.id}
									onClick={() => void handleUnarchive(thread.id)}
								>
									<ArchiveRestoreIcon className="size-3.5" />
									{pendingId === thread.id ? "恢复中…" : "恢复"}
								</Button>
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};
