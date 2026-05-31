import { NextResponse, type NextRequest } from "next/server";
import {
  usernameToAuthEmail,
  validateUsername,
} from "@/lib/auth/username";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

type LoginBody = {
  username?: string;
  password?: string;
  mode?: "login" | "register";
};

export async function POST(request: NextRequest) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "请求格式无效" }, { status: 400 });
  }

  const normalized = body.username?.trim() ?? "";
  const password = body.password ?? "";
  const mode = body.mode === "register" ? "register" : "login";

  const usernameError = validateUsername(normalized);
  if (usernameError) {
    return NextResponse.json({ error: usernameError }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  const email = usernameToAuthEmail(normalized);
  const response = NextResponse.json({ ok: true });
  const supabase = createRouteHandlerClient(request, response);

  if (mode === "login") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return NextResponse.json(
        {
          error: error.message.includes("Invalid login")
            ? "用户名或密码错误"
            : error.message,
        },
        { status: 401 },
      );
    }
    return response;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: normalized },
    },
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message.includes("already registered")
          ? "用户名已被占用"
          : error.message,
      },
      { status: 400 },
    );
  }

  if (!data.session) {
    return NextResponse.json(
      {
        error:
          "注册成功，但需在 Supabase 关闭邮箱确认后才能直接登录；或改用已有账号登录。",
      },
      { status: 400 },
    );
  }

  return response;
}
