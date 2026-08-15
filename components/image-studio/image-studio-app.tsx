"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FC,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ChatAiProviderProvider } from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { ImageStudioCanvas } from "@/components/image-studio/image-studio-canvas";
import { ImageStudioControlPanel } from "@/components/image-studio/image-studio-control-panel";
import { ImageStudioHeader } from "@/components/image-studio/image-studio-header";
import { ImageStudioSidebar } from "@/components/image-studio/image-studio-sidebar";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { getDisplayUsername } from "@/lib/auth/username";
import {
	FALLBACK_CHAT_MODELS,
	setClientChatModels,
	type ChatModel,
} from "@/lib/chat/models";
import type { ImageGenerationParams } from "@/lib/image-generation/settings";
import type { ImageSessionSummary } from "@/lib/image-generation/session";
import { threadIdFromPathname, threadPath } from "@/lib/chat/routes";
import { createClient } from "@/lib/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const sidebarProps = (
	sessions: ImageSessionSummary[],
	activeId: string | null,
	composeMode: boolean,
	sessionsLoading: boolean,
	onSelect: (id: string) => void,
	onCompose: () => void,
	onDelete: (id: string) => void,
	onNavigate?: () => void,
) => ({
	sessions,
	activeId,
	composeMode,
	loading: sessionsLoading,
	onSelect,
	onCompose,
	onDelete,
	onNavigate,
});

const ImageStudioApp: FC = () => {
	const router = useRouter();
	const pathname = usePathname();
	// Read session from the URL so layout can stay mounted across /image ↔ /image/{id}.
	const sessionId = threadIdFromPathname(pathname) ?? undefined;
	const isMobile = useIsMobile();
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [authReady, setAuthReady] = useState(false);
	const [sessions, setSessions] = useState<ImageSessionSummary[]>([]);
	const [sessionsLoading, setSessionsLoading] = useState(true);
	const [models, setModels] = useState<ChatModel[]>(() =>
		FALLBACK_CHAT_MODELS.filter((m) => m.uiProvider === "image"),
	);
	const [modelsLoading, setModelsLoading] = useState(true);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [composeMode, setComposeMode] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatingPrompt, setGeneratingPrompt] = useState<string>();
	const [error, setError] = useState<string | null>(null);
	const [draftPrompt, setDraftPrompt] = useState("");
	const promptInputRef = useRef<HTMLTextAreaElement>(null);
	const supabase = useMemo(() => createClient(), []);

	const closeMobileSidebar = useCallback(() => {
		setMobileSidebarOpen(false);
	}, []);

	useEffect(() => {
		if (!isMobile) setMobileSidebarOpen(false);
	}, [isMobile]);

	const fillPrompt = useCallback((text: string) => {
		setDraftPrompt(text);
		requestAnimationFrame(() => {
			promptInputRef.current?.focus();
			const len = text.length;
			promptInputRef.current?.setSelectionRange(len, len);
		});
	}, []);

	const activeSession = useMemo(
		() => sessions.find((s) => s.id === activeId) ?? null,
		[sessions, activeId],
	);

	const refreshSessions = useCallback(async () => {
		const res = await fetch("/api/images/sessions", { cache: "no-store" });
		if (!res.ok) return;
		const data = (await res.json()) as { sessions: ImageSessionSummary[] };
		setSessions(data.sessions ?? []);
	}, []);

	useEffect(() => {
		supabase.auth.getUser().then(({ data: { user: current } }) => {
			setUser(current);
			setAuthReady(true);
		});
	}, [supabase]);

	useEffect(() => {
		if (!authReady) return;
		setSessionsLoading(true);
		void refreshSessions().finally(() => setSessionsLoading(false));
	}, [authReady, refreshSessions]);

	useEffect(() => {
		void (async () => {
			try {
				const res = await fetch("/api/models", { cache: "no-store" });
				const data = await res.json();
				const all = (data.models ?? FALLBACK_CHAT_MODELS) as ChatModel[];
				const imageModels = all.filter((m) => m.uiProvider === "image");
				setClientChatModels(all);
				setModels(
					imageModels.length
						? imageModels
						: FALLBACK_CHAT_MODELS.filter((m) => m.uiProvider === "image"),
				);
			} finally {
				setModelsLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		if (!authReady || sessionsLoading) return;
		if (!sessionId) {
			setComposeMode(true);
			setActiveId(null);
			return;
		}
		const exists = sessions.some((s) => s.id === sessionId);
		if (exists) {
			setComposeMode(false);
			setActiveId(sessionId);
		} else if (sessions.length > 0) {
			router.replace(threadPath("image"));
		}
	}, [authReady, sessionId, sessions, sessionsLoading, router]);

	const handleCompose = () => {
		setComposeMode(true);
		setActiveId(null);
		setError(null);
		router.push(threadPath("image"));
	};

	const handleSelect = (id: string) => {
		setComposeMode(false);
		setActiveId(id);
		setError(null);
		router.push(threadPath("image", id));
	};

	const handleDelete = async (id: string) => {
		await fetch(`/api/images/sessions/${id}`, { method: "DELETE" });
		setSessions((prev) => prev.filter((s) => s.id !== id));
		if (activeId === id || sessionId === id) handleCompose();
	};

	const handleGenerate = async (params: ImageGenerationParams) => {
		setIsGenerating(true);
		setGeneratingPrompt(params.prompt);
		setComposeMode(false);
		setError(null);
		try {
			const res = await fetch("/api/images/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});
			const data = (await res.json()) as {
				session?: ImageSessionSummary;
				error?: string;
			};
			if (!res.ok || data.error) {
				setError(data.error ?? "生成失败");
				return;
			}
			if (data.session) {
				setSessions((prev) => [
					data.session!,
					...prev.filter((s) => s.id !== data.session!.id),
				]);
				setActiveId(data.session.id);
				setComposeMode(false);
				router.replace(threadPath("image", data.session.id));
			}
		} catch {
			setError("网络错误，请稍后重试");
		} finally {
			setIsGenerating(false);
			setGeneratingPrompt(undefined);
		}
	};

	const sidebarCommon = sidebarProps(
		sessions,
		activeId,
		composeMode,
		sessionsLoading,
		handleSelect,
		handleCompose,
		handleDelete,
	);

	if (!authReady) {
		return (
			<main className="flex h-dvh items-center justify-center text-muted-foreground text-sm">
				加载中…
			</main>
		);
	}

	if (!user) return null;

	return (
		<main className="flex h-dvh flex-col bg-[#f7faff] dark:bg-[#0a0e14]">
			<ImageStudioHeader
				displayName={getDisplayUsername(user)}
				showSidebarToggle
				onToggleSidebar={() => setMobileSidebarOpen((open) => !open)}
			/>

			<section className="flex min-h-0 flex-1">
				{/* 桌面端：固定侧边栏 */}
				<aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-[#d4e4ff]/80 md:flex dark:border-[#2a3a52]">
					<ImageStudioSidebar {...sidebarCommon} />
				</aside>

				{/* 移动端：抽屉侧边栏 */}
				<Sheet
					open={isMobile && mobileSidebarOpen}
					onOpenChange={(open) => {
						if (isMobile) setMobileSidebarOpen(open);
					}}
				>
					<SheetContent
						side="left"
						className="flex h-full w-[min(100vw,280px)] flex-col border-[#d4e4ff] bg-[#f0f6ff] p-0 dark:border-[#2a3a52] dark:bg-[#0c1018] [&>button]:hidden"
					>
						<SheetHeader className="sr-only">
							<SheetTitle>历史作品</SheetTitle>
							<SheetDescription>浏览与切换绘图会话</SheetDescription>
						</SheetHeader>
						<ImageStudioSidebar
							{...sidebarCommon}
							onNavigate={closeMobileSidebar}
						/>
					</SheetContent>
				</Sheet>

				{/* 主区域：画布 + 控制面板 */}
				<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
					<section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
						{error ? (
							<p
								role="alert"
								className="absolute top-2 right-2 left-2 z-20 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm"
							>
								{error}
							</p>
						) : null}
						<ImageStudioCanvas
							session={composeMode ? null : activeSession}
							isGenerating={isGenerating}
							generatingPrompt={generatingPrompt}
							onSelectSuggestion={composeMode ? fillPrompt : undefined}
						/>
					</section>
					<section className="relative z-10 flex h-[min(52dvh,520px)] min-h-[280px] w-full shrink-0 flex-col overflow-hidden border-t border-[#d4e4ff]/80 shadow-[0_-6px_20px_rgba(13,59,140,0.08)] lg:h-auto lg:min-h-0 lg:w-[min(400px,36vw)] lg:border-t-0 lg:shadow-none dark:border-[#2a3a52] dark:shadow-[0_-6px_20px_rgba(0,0,0,0.25)]">
						<ImageStudioControlPanel
							models={models}
							modelsLoading={modelsLoading}
							isGenerating={isGenerating}
							prompt={draftPrompt}
							onPromptChange={setDraftPrompt}
							promptInputRef={promptInputRef}
							onGenerate={handleGenerate}
						/>
					</section>
				</section>
			</section>
		</main>
	);
};

export const ImageStudioRoot: FC = () => (
	<ChatAiProviderProvider initialProvider="image">
		<ImageStudioApp />
	</ChatAiProviderProvider>
);
