"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import type { User } from "@supabase/supabase-js";
import { ChatAiProviderProvider } from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { ImageStudioCanvas } from "@/components/image-studio/image-studio-canvas";
import { ImageStudioControlPanel } from "@/components/image-studio/image-studio-control-panel";
import { ImageStudioHeader } from "@/components/image-studio/image-studio-header";
import { ImageStudioSidebar } from "@/components/image-studio/image-studio-sidebar";
import { getDisplayUsername } from "@/lib/auth/username";
import {
  FALLBACK_CHAT_MODELS,
  setClientChatModels,
  type ChatModel,
} from "@/lib/chat/models";
import type { ImageGenerationParams } from "@/lib/image-generation/settings";
import type { ImageSessionSummary } from "@/lib/image-generation/session";
import { createClient } from "@/lib/supabase/client";

const ImageStudioApp: FC = () => {
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

  const handleCompose = () => {
    setComposeMode(true);
    setActiveId(null);
    setError(null);
  };

  const handleSelect = (id: string) => {
    setComposeMode(false);
    setActiveId(id);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/images/sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) handleCompose();
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
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setIsGenerating(false);
      setGeneratingPrompt(undefined);
    }
  };

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
      <ImageStudioHeader displayName={getDisplayUsername(user)} />
      <section className="flex min-h-0 flex-1">
        <ImageStudioSidebar
          sessions={sessions}
          activeId={activeId}
          composeMode={composeMode}
          loading={sessionsLoading}
          onSelect={handleSelect}
          onCompose={handleCompose}
          onDelete={handleDelete}
        />
        <section className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {error ? (
              <p
                role="alert"
                className="absolute top-2 right-2 left-2 z-10 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm"
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
          <section className="h-[min(48dvh,520px)] w-full shrink-0 lg:h-auto lg:w-[min(400px,36vw)]">
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
