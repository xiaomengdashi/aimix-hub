import { type AppUserRole, isAppUserRole } from "@/lib/auth/roles";

export function isAdminRole(role: unknown): role is AppUserRole {
  return isAppUserRole(role) && role === "admin";
}
