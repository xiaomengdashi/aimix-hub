"use client";

import type { FC, ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import type { AppUserRole } from "@/lib/auth/roles";

type ConsoleRootProps = {
	displayName: string;
	role: AppUserRole | null;
	isAdmin: boolean;
	children: ReactNode;
};

export const ConsoleRoot: FC<ConsoleRootProps> = (props) => (
	<ConsoleShell {...props} />
);
