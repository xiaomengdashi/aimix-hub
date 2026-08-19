import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { isMessageFeedbackType } from "@/lib/chat/feedback-adapter";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { threadId?: unknown; messageId?: unknown; type?: unknown };
  try {
    body = (await req.json()) as {
      threadId?: unknown;
      messageId?: unknown;
      type?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const threadId = typeof body.threadId === "string" ? body.threadId.trim() : "";
  const messageId =
    typeof body.messageId === "string" ? body.messageId.trim() : "";
  if (!threadId || !messageId || !isMessageFeedbackType(body.type)) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: thread, error: threadError } = await supabase
    .from("threads")
    .select("id")
    .eq("id", threadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (threadError) {
    return NextResponse.json({ error: threadError.message }, { status: 500 });
  }
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const { error } = await supabase.from("message_feedback").upsert(
    {
      user_id: user.id,
      thread_id: threadId,
      message_id: messageId,
      type: body.type,
    },
    { onConflict: "user_id,thread_id,message_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, type: body.type });
}
