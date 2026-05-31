import { NextResponse } from "next/server";
import { listGatewayModelOptions } from "@/lib/admin/list-gateway-models";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  try {
    const models = await listGatewayModelOptions();
    return NextResponse.json({ models });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "拉取网关模型列表失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
