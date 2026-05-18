import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getImageSession } from "@/lib/image-generation/list-sessions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const session = await getImageSession(user.id, id);
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const { error } = await supabase
    .from("threads")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("provider", "image");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
