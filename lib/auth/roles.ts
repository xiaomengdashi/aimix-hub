export type AppUserRole = "admin" | "user";

export const APP_USER_ROLE_LABELS: Record<AppUserRole, string> = {
  admin: "管理员",
  user: "普通用户",
};

export function isAppUserRole(value: unknown): value is AppUserRole {
  return value === "admin" || value === "user";
}
