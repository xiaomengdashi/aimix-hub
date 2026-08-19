"use client";

import type { FC, ReactNode } from "react";
import { ShareIcon } from "lucide-react";
import { useAuiState } from "@assistant-ui/react";
import { OtherThreadListSidebar } from "@/components/assistant-ui/providers/other/thread-list-sidebar";
import { TooltipIconButton } from "@/components/assistant-ui/message/tooltip-icon-button";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/auth/user-menu";

const ThreadTitle: FC = () => {
	const title = useAuiState(
		(s) =>
			s.threads.threadItems.find((t) => t.id === s.threads.mainThreadId)?.title,
	);

	return (
		<span className="min-w-0 truncate text-sm font-medium">
			{title ?? "New Chat"}
		</span>
	);
};

export const OtherLayout: FC<{
	displayUsername: string;
	chatError: string | null;
	children: ReactNode;
}> = ({ displayUsername, chatError, children }) => (
	<SidebarProvider className="h-dvh min-h-0 overflow-hidden">
		<OtherThreadListSidebar />
		<SidebarInset className="min-h-0 overflow-hidden bg-muted/30 p-2 md:pl-0">
			<div className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
					<header className="flex h-12 shrink-0 items-center gap-2 px-4">
						<SidebarTrigger className="size-8" />
						<ThreadTitle />
						<TooltipIconButton
							variant="ghost"
							size="icon"
							tooltip="Share"
							side="bottom"
							disabled
							className="ms-auto size-8"
						>
							<ShareIcon className="size-4" />
						</TooltipIconButton>
						<UserMenu displayName={displayUsername} />
					</header>
					{chatError ? (
						<div
							role="alert"
							className="mx-4 mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-destructive text-sm"
						>
							{chatError}
						</div>
					) : null}
					<div className="min-h-0 flex-1 overflow-hidden">{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
);
