export const dynamic = "force-dynamic";

export default function SetupPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 px-4 py-12">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">需要完成 Supabase 配置</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          当前访问失败是因为项目启用了云端会话持久化，但{" "}
          <code className="rounded bg-muted px-1">.env.local</code>{" "}
          中尚未配置 Supabase。请按下列步骤操作后重启{" "}
          <code className="rounded bg-muted px-1">npm run dev</code>。
        </p>
      </div>

      <section className="space-y-3 rounded-xl border bg-card p-5 text-sm">
        <h2 className="font-medium">1. 创建 Supabase 项目</h2>
        <p className="text-muted-foreground">
          打开{" "}
          <a
            className="text-primary underline"
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
          >
            supabase.com/dashboard
          </a>
          ，新建项目并等待数据库就绪。
        </p>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5 text-sm">
        <h2 className="font-medium">2. 填写 .env.local</h2>
        <p className="text-muted-foreground">
          在 Settings → API 复制 Project URL 与 anon public key：
        </p>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
          {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# 已有（聊天模型）
ANTHROPIC_API_KEY=你的密钥
ANTHROPIC_BASE_URL=https://yunwu.ai/v1`}
        </pre>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5 text-sm">
        <h2 className="font-medium">3. 执行数据库迁移</h2>
        <p className="text-muted-foreground">
          在 Supabase → SQL Editor 中运行仓库文件{" "}
          <code className="rounded bg-muted px-1">
            supabase/migrations/001_chat_threads.sql
          </code>
          （创建 threads / messages 表与 RLS）。
        </p>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5 text-sm">
        <h2 className="font-medium">4. 配置 Authentication（用户名密码）</h2>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>启用 Email 提供商，并打开「Email + Password」</li>
          <li>关闭「Confirm email」（本地开发建议关闭，否则注册后无法立即登录）</li>
          <li>Site URL: http://localhost:3000</li>
        </ul>
      </section>

      <p className="text-muted-foreground text-xs">
        配置完成后刷新本页，将自动跳转到登录页。
      </p>
    </main>
  );
}
