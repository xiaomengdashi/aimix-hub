/** 将 threads.provider 约束失败转为可操作的提示 */
export function formatThreadsProviderError(message: string | undefined): string {
  if (!message) return "创建会话失败";
  if (
    message.includes("threads_provider_check") ||
    message.includes('provider in (')
  ) {
    return [
      "数据库尚未支持当前应用（例如 provider = grok 或 image）。",
      "请在 Supabase → SQL Editor 执行最新迁移：",
      "supabase/migrations/015_thread_provider_grok.sql",
      "执行后刷新页面重试。",
    ].join(" ");
  }
  return message;
}
