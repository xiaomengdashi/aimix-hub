import { NextResponse } from "next/server";
import { listManagedUsers } from "@/lib/admin/list-users";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const users = await listManagedUsers(supabase);
    return NextResponse.json({ users });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "加载用户列表失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
