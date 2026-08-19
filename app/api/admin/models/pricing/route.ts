import { NextResponse } from "next/server";
import { lookupPricesForModelIds } from "@/lib/admin/models-dev-pricing";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  let body: {
    ids?: Array<string | { id: string; uiProvider?: string; apiModel?: string }>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = (body.ids ?? []).map((item) =>
    typeof item === "string" ? { id: item } : item,
  );
  if (ids.length === 0) {
    return NextResponse.json({ prices: {} });
  }

  try {
    const prices = await lookupPricesForModelIds(ids);
    return NextResponse.json({ prices });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "同步 models.dev 价格失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
