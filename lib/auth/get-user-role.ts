import type { SupabaseClient } from "@supabase/supabase-js";
import { type AppUserRole, isAppUserRole } from "@/lib/auth/roles";

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AppUserRole | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("app_role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.app_role || !isAppUserRole(data.app_role)) {
    return null;
  }

  return data.app_role;
}
