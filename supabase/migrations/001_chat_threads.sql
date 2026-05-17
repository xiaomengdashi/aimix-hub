-- Chat threads and messages for assistant-ui persistence
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  is_archived boolean not null default false,
  external_id text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text not null,
  thread_id uuid not null references public.threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  parent_id text,
  format text not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  primary key (id, thread_id)
);

create index if not exists threads_user_last_message_idx
  on public.threads (user_id, last_message_at desc);

create index if not exists messages_thread_created_idx
  on public.messages (thread_id, created_at);

alter table public.threads enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Users can select own threads" on public.threads;
create policy "Users can select own threads"
  on public.threads for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own threads" on public.threads;
create policy "Users can insert own threads"
  on public.threads for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own threads" on public.threads;
create policy "Users can update own threads"
  on public.threads for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own threads" on public.threads;
create policy "Users can delete own threads"
  on public.threads for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can select own messages" on public.messages;
create policy "Users can select own messages"
  on public.messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own messages" on public.messages;
create policy "Users can insert own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own messages" on public.messages;
create policy "Users can update own messages"
  on public.messages for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own messages" on public.messages;
create policy "Users can delete own messages"
  on public.messages for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists threads_set_updated_at on public.threads;
create trigger threads_set_updated_at
  before update on public.threads
  for each row
  execute function public.set_updated_at();
