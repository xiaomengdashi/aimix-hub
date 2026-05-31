import type { User } from "@supabase/supabase-js";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const AUTH_EMAIL_DOMAIN = "app.claude-clone.auth";

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  if (!USERNAME_PATTERN.test(username)) {
    return "用户名为 3–20 位，仅支持字母、数字和下划线";
  }
  return null;
}

/** Supabase 使用邮箱登录；用户名映射为内部邮箱，对用户不可见 */
export function usernameToAuthEmail(username: string): string {
  return `${normalizeUsername(username)}@${AUTH_EMAIL_DOMAIN}`;
}

export function getDisplayUsername(user: User): string {
  const email = user.email;
  // 内部登录邮箱与用户名一一对应，改名后比 JWT 内嵌的 user_metadata 更可靠
  if (email?.endsWith(`@${AUTH_EMAIL_DOMAIN}`)) {
    return email.slice(0, -(`@${AUTH_EMAIL_DOMAIN}`.length));
  }
  const fromMeta = user.user_metadata?.username;
  if (typeof fromMeta === "string" && fromMeta.trim()) {
    return fromMeta.trim();
  }
  return email?.split("@")[0] ?? "用户";
}
