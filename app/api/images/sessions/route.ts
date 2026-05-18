import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { listImageSessions } from "@/lib/image-generation/list-sessions";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await listImageSessions(user.id);
  return NextResponse.json({ sessions });
}
