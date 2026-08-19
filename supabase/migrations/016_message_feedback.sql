-- Per-user thumbs up/down on assistant messages

create table if not exists public.message_feedback (
  user_id uuid not null references auth.users (id) on delete cascade,
  thread_id uuid not null references public.threads (id) on delete cascade,
  message_id text not null,
  type text not null check (type in ('positive', 'negative')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, thread_id, message_id)
);

create index if not exists message_feedback_thread_idx
  on public.message_feedback (thread_id, created_at desc);

alter table public.message_feedback enable row level security;

drop policy if exists "Users can select own message feedback" on public.message_feedback;
create policy "Users can select own message feedback"
  on public.message_feedback for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own message feedback" on public.message_feedback;
create policy "Users can insert own message feedback"
  on public.message_feedback for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own message feedback" on public.message_feedback;
create policy "Users can update own message feedback"
  on public.message_feedback for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own message feedback" on public.message_feedback;
create policy "Users can delete own message feedback"
  on public.message_feedback for delete
  using (auth.uid() = user_id);

drop trigger if exists message_feedback_set_updated_at on public.message_feedback;
create trigger message_feedback_set_updated_at
  before update on public.message_feedback
  for each row
  execute function public.set_updated_at();
