import { NextResponse } from "next/server";
import { fetchAdminDashboardStats } from "@/lib/admin/fetch-dashboard-stats";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  try {
    const dashboard = await fetchAdminDashboardStats();
    return NextResponse.json({ dashboard });
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载控制台统计失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
