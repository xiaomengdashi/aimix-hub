import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppUserRole } from "@/lib/auth/roles";

export class UserRoleUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserRoleUpdateError";
  }
}

export async function updateManagedUserRole(
  supabase: SupabaseClient,
  targetUserId: string,
  nextRole: AppUserRole,
): Promise<void> {
  const { error } = await supabase.rpc("admin_update_user_role", {
    target_user_id: targetUserId,
    p_app_role: nextRole,
  });

  if (error) {
    throw new UserRoleUpdateError(error.message);
  }
}
