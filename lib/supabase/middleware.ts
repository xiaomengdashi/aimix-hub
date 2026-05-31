import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { DEFAULT_CHAT_AI_PROVIDER } from "@/lib/chat/provider";
import { providerPath } from "@/lib/chat/routes";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    if (pathname === "/setup" || pathname.startsWith("/_next")) {
      return NextResponse.next({ request });
    }
    const setupUrl = request.nextUrl.clone();
    setupUrl.pathname = "/setup";
    return NextResponse.redirect(setupUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    url!,
    anonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  if (!user && !isAuthRoute) {
    if (pathname.startsWith("/api/")) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = providerPath(DEFAULT_CHAT_AI_PROVIDER);
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("app_role")
      .eq("id", user.id)
      .maybeSingle();

    if (!isAdminRole(profile?.app_role)) {
      const url = request.nextUrl.clone();
      url.pathname = providerPath(DEFAULT_CHAT_AI_PROVIDER);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
