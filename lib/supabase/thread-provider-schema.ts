import type { PostgrestError } from "@supabase/supabase-js";
import type { ChatAiProvider } from "@/lib/chat/provider";

export const THREAD_SELECT_WITH_PROVIDER =
  "id, title, is_archived, external_id, provider";

export const THREAD_SELECT_LEGACY = "id, title, is_archived, external_id";

export type ThreadProviderSchemaMode = "unknown" | "with_provider" | "legacy";

export function isMissingProviderColumnError(
  error: PostgrestError | null | undefined,
): boolean {
  if (!error) return false;
  return (
    error.code === "42703" &&
    (error.message?.includes("provider") ?? false)
  );
}

export function resolveSchemaModeFromError(
  current: ThreadProviderSchemaMode,
  error: PostgrestError | null | undefined,
): ThreadProviderSchemaMode {
  if (isMissingProviderColumnError(error)) return "legacy";
  return current === "unknown" ? "with_provider" : current;
}

/** 未迁移时：历史会话视为 Claude，国产 provider 无会话 */
export function legacyProviderAllowsThreads(provider: ChatAiProvider): boolean {
  return provider === "claude";
}
