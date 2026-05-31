"use client";

import { useState, type FC, type FormEvent } from "react";
import {
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
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    let response: Response;
    try {
      response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: normalized,
          password,
          mode,
        }),
      });
    } catch {
      setStatus("error");
      setErrorMessage("网络错误，请稍后重试");
      return;
    }

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(payload?.error ?? "登录失败，请重试");
      return;
    }

    window.location.assign("/");
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
