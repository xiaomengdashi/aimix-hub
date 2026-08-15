import type { FC, ReactNode } from "react";

type ConsolePageHeaderProps = {
	title: string;
	description?: ReactNode;
};

export const ConsolePageHeader: FC<ConsolePageHeaderProps> = ({
	title,
	description,
}) => (
	<header className="mb-8">
		<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
		{description ? (
			<p className="mt-1.5 max-w-2xl text-muted-foreground text-sm">
				{description}
			</p>
		) : null}
	</header>
);
