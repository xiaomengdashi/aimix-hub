import { NextResponse } from "next/server";
import {
  getAdminIntegrationSettings,
  updateAdminIntegrationSettings,
} from "@/lib/admin/model-management";
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
    const settings = await getAdminIntegrationSettings(supabase);
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载配置失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  let body: {
    aiBaseUrl?: string;
    aiApiKey?: string | null;
    tavilyApiKey?: string | null;
    tavilyBaseUrl?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.aiBaseUrl?.trim()) {
    return NextResponse.json({ error: "请填写 AI Base URL" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const settings = await updateAdminIntegrationSettings(supabase, {
      aiBaseUrl: body.aiBaseUrl.trim(),
      aiApiKey: body.aiApiKey ?? null,
      tavilyApiKey: body.tavilyApiKey ?? null,
      tavilyBaseUrl: body.tavilyBaseUrl?.trim() || null,
    });
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存配置失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
