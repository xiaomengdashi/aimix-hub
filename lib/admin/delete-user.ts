import type { SupabaseClient } from "@supabase/supabase-js";

export class UserDeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserDeleteError";
  }
}

export async function deleteManagedUser(
  supabase: SupabaseClient,
  targetUserId: string,
): Promise<void> {
  const { error } = await supabase.rpc("admin_delete_user", {
    target_user_id: targetUserId,
  });

  if (error) {
    throw new UserDeleteError(error.message);
  }
}
