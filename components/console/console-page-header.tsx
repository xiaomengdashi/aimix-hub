import type { FC, ReactNode } from "react";

type ConsolePageHeaderProps = {
	eyebrow?: string;
	title: string;
	description?: ReactNode;
	action?: ReactNode;
};

export const ConsolePageHeader: FC<ConsolePageHeaderProps> = ({
	eyebrow,
	title,
	description,
	action,
}) => (
	<header className="mb-8">
		{eyebrow ? (
			<p className="mb-1.5 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
				{eyebrow}
			</p>
		) : null}
		<div className="flex flex-wrap items-end justify-between gap-3">
			<div className="min-w-0">
				<h1 className="font-semibold text-3xl tracking-tight">{title}</h1>
				{description ? (
					<p className="mt-2 max-w-2xl text-muted-foreground text-sm">
						{description}
					</p>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	</header>
);
