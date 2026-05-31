"use client";

import { useEffect, useMemo, useState } from "react";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { createClient } from "@/lib/supabase/client";

export function useUserIsAdmin(): boolean {
  const supabase = useMemo(() => createClient(), []);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("user_profiles")
        .select("app_role")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setIsAdmin(isAdminRole(data?.app_role));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return isAdmin;
}
