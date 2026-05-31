import type { SupabaseClient } from "@supabase/supabase-js";

export async function setThreadPinned(
  supabase: SupabaseClient,
  remoteId: string,
  pinned: boolean,
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("threads")
    .update({
      is_pinned: pinned,
      pinned_at: pinned ? new Date().toISOString() : null,
    })
    .eq("id", remoteId)
    .eq("user_id", user.id);

  if (error) throw error;
}
