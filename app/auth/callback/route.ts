import { NextResponse, type NextRequest } from "next/server";
import { completeAuthFromRequest } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const result = await completeAuthFromRequest(request, response);

  if (result.ok) {
    return response;
  }

  console.error("[auth/callback]", result.message);
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "auth");
  loginUrl.searchParams.set("message", result.message);
  return NextResponse.redirect(loginUrl);
}
