"use client";

import Link from "next/link";
import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { ImagePreviewDialog } from "@/components/assistant-ui/message/image-preview-dialog";
import { Button } from "@/components/ui/button";
import type { ImageSessionSummary } from "@/lib/image-generation/session";
import { threadPath } from "@/lib/chat/routes";

export const AccountRecentImagesPanel: FC = () => {
	const [sessions, setSessions] = useState<ImageSessionSummary[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		void (async () => {
			try {
				const res = await fetch("/api/images/sessions", { cache: "no-store" });
				if (!res.ok) return;
				const data = (await res.json()) as {
					sessions?: ImageSessionSummary[];
				};
				if (!cancelled) {
					setSessions(
						(data.sessions ?? []).filter(
							(session) =>
								session.status === "completed" && Boolean(session.imageUrl),
						),
					);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	const recent = sessions.slice(0, 8);

	return (
		<section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
			<div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
				<div>
					<h2 className="text-base font-semibold tracking-tight text-slate-900">
						最近绘图
					</h2>
					<p className="mt-0.5 text-sm text-slate-500">
						点击缩略图可放大预览
					</p>
				</div>
				<Button variant="outline" size="sm" asChild>
					<Link href="/image">
						<ExternalLinkIcon className="size-3.5" />
						打开绘图工作台
					</Link>
				</Button>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-10 text-slate-500">
					<Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden />
					加载中…
				</div>
			) : recent.length === 0 ? (
				<p className="py-10 text-center text-sm text-slate-500">暂无绘图作品</p>
			) : (
				<ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{recent.map((session) => (
						<li key={session.id}>
							<ImagePreviewDialog
								src={session.imageUrl!}
								alt={session.prompt}
								title={session.title ?? session.prompt}
								triggerClassName="block w-full overflow-hidden rounded-xl border border-slate-200/80"
								imageClassName="aspect-square w-full object-cover"
							/>
							<p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
								{session.title ?? session.prompt}
							</p>
							<Link
								href={threadPath("image", session.id)}
								className="mt-0.5 inline-block text-xs text-blue-600 hover:underline"
							>
								查看详情
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};
