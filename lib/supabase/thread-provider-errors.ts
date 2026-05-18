/** 将 threads.provider 约束失败转为可操作的提示 */
export function formatThreadsProviderError(message: string | undefined): string {
  if (!message) return "创建会话失败";
  if (
    message.includes("threads_provider_check") ||
    message.includes('provider in (')
  ) {
    return [
      "数据库尚未支持绘图应用（provider = image）。",
      "请在 Supabase → SQL Editor 执行：",
      "supabase/migrations/003_thread_provider_image.sql",
      "执行后刷新页面重试。",
    ].join(" ");
  }
  return message;
}
