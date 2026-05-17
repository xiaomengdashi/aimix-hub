-- Bind each thread to an AI provider; existing rows default to Claude
alter table public.threads
  add column if not exists provider text not null default 'claude';

update public.threads
set provider = 'claude'
where provider is null or provider = '';

alter table public.threads
  drop constraint if exists threads_provider_check;

alter table public.threads
  add constraint threads_provider_check
  check (provider in ('claude', 'chatgpt', 'gemini', 'other'));

create index if not exists threads_user_provider_last_message_idx
  on public.threads (user_id, provider, last_message_at desc);
