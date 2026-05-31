import type { SupabaseClient } from "@supabase/supabase-js";
import type { ManagedUser } from "@/lib/admin/types";
import { type AppUserRole, isAppUserRole } from "@/lib/auth/roles";

type AdminListUsersRow = {
  id: string;
  username: string;
  role: AppUserRole;
  created_at: string;
  last_sign_in_at: string | null;
};

export async function listManagedUsers(
  supabase: SupabaseClient,
): Promise<ManagedUser[]> {
  const { data, error } = await supabase.rpc("admin_list_users");

  if (error) {
    throw new Error(error.message);
  }

  return ((data as AdminListUsersRow[] | null) ?? []).map((row) => ({
    id: row.id,
    username: row.username,
    role: isAppUserRole(row.role) ? row.role : "user",
    createdAt: row.created_at,
    lastSignInAt: row.last_sign_in_at,
  }));
}
