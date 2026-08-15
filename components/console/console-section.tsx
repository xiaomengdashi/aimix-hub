import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ConsoleSectionProps = {
	title: string;
	description?: string;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
};

export const ConsoleSection: FC<ConsoleSectionProps> = ({
	title,
	description,
	action,
	children,
	className,
}) => (
	<section
		className={cn(
			"rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]",
			className,
		)}
	>
		<div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
			<div className="min-w-0">
				<h2 className="font-semibold text-slate-900 text-base tracking-tight">
					{title}
				</h2>
				{description ? (
					<p className="mt-0.5 text-muted-foreground text-sm">{description}</p>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
		<div className="pt-4">{children}</div>
	</section>
);
