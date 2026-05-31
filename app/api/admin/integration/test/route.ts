import { NextResponse } from "next/server";
import { fetchGatewayModelRows } from "@/lib/ai-gateway/gateway-models";
import { getGatewayCredentials } from "@/lib/admin/server-integration-settings";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  try {
    const credentials = await getGatewayCredentials();
    const rows = await fetchGatewayModelRows(credentials);
    return NextResponse.json({
      ok: true,
      count: rows.length,
      modelsUrl: `${credentials.baseUrl.replace(/\/$/, "")}/models`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "连接测试失败";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
