"use client";

import { useRouter } from "next/navigation";
import { useState, type FC, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  usernameToAuthEmail,
  validateUsername,
} from "@/lib/auth/username";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  authError?: boolean;
  authErrorMessage?: string;
};

type Mode = "login" | "register";

export const LoginForm: FC<LoginFormProps> = ({
  authError = false,
  authErrorMessage,
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const normalized = username.trim();
    const usernameError = validateUsername(normalized);
    if (usernameError) {
      setStatus("error");
      setErrorMessage(usernameError);
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setErrorMessage("密码至少 6 位");
      return;
    }

    const email = usernameToAuthEmail(normalized);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus("error");
        setErrorMessage(
          error.message.includes("Invalid login")
            ? "用户名或密码错误"
            : error.message,
        );
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: normalized },
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message.includes("already registered")
          ? "用户名已被占用"
          : error.message,
      );
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setStatus("error");
    setErrorMessage(
      "注册成功，但需在 Supabase 关闭邮箱确认后才能直接登录；或改用已有账号登录。",
    );
  };

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div className="space-y-1 text-center">
        <h1 className="font-semibold text-xl">
          {mode === "login" ? "登录" : "注册"} AI Chat
        </h1>
        <p className="text-muted-foreground text-sm">
          使用用户名和密码，对话将保存到云端。
        </p>
      </div>

      {authError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          登录失败：{authErrorMessage ?? "请重试"}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          minLength={3}
          maxLength={20}
        />
        <PasswordInput
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "处理中…"
            : mode === "login"
              ? "登录"
              : "注册"}
        </Button>
      </form>

      <p className="text-center text-muted-foreground text-sm">
        {mode === "login" ? "还没有账号？" : "已有账号？"}
        <button
          type="button"
          className="ms-1 text-primary underline-offset-4 hover:underline"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setErrorMessage(null);
            setStatus("idle");
          }}
        >
          {mode === "login" ? "去注册" : "去登录"}
        </button>
      </p>

      {errorMessage ? (
        <p className="text-center text-destructive text-sm">{errorMessage}</p>
      ) : null}
    </div>
  );
};
