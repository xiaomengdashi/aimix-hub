-- 独立绘图应用的会话隔离
alter table public.threads
  drop constraint if exists threads_provider_check;

alter table public.threads
  add constraint threads_provider_check
  check (provider in ('claude', 'chatgpt', 'gemini', 'other', 'image'));
