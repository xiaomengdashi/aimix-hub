import { NextResponse } from "next/server";
import {
  updateManagedUserRole,
  UserRoleUpdateError,
} from "@/lib/admin/update-user-role";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isAppUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { userId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式无效" }, { status: 400 });
  }

  const role =
    typeof body === "object" &&
    body !== null &&
    "role" in body &&
    isAppUserRole(body.role)
      ? body.role
      : null;

  if (!role) {
    return NextResponse.json({ error: "无效的角色" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    await updateManagedUserRole(supabase, userId, role);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UserRoleUpdateError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "更新角色失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
