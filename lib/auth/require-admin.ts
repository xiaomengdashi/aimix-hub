import type { User } from "@supabase/supabase-js";
import { getUserRole } from "@/lib/auth/get-user-role";
import { requireUser } from "@/lib/auth/require-user";
import type { AppUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  user: User;
  role: AppUserRole;
};

export async function requireAdmin(): Promise<AdminSession | null> {
  const user = await requireUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const role = await getUserRole(supabase, user.id);
  if (role !== "admin") {
    return null;
  }

  return { user, role };
}
