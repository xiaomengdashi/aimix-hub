import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import {
  generateImageSession,
  parseImageGenerationBody,
} from "@/lib/image-generation/generate-image";
import { getChatModel } from "@/lib/chat/models";

export const maxDuration = 300;

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  const parsed = parseImageGenerationBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const modelMeta = getChatModel(parsed.model);
  const result = await generateImageSession(
    user.id,
    parsed,
    modelMeta?.name,
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}
