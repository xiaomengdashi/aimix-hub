import { NextResponse } from "next/server";
import {
  listManagedModels,
  saveManagedModels,
} from "@/lib/admin/model-management";
import type { ModelCatalogInput } from "@/lib/admin/types";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const models = await listManagedModels(supabase);
    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载模型配置失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  let body: { models?: ModelCatalogInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.models)) {
    return NextResponse.json({ error: "无效的模型列表" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    await saveManagedModels(supabase, body.models);
    const models = await listManagedModels(supabase);
    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存模型配置失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
