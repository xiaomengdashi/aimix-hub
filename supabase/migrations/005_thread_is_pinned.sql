-- Thread pinning for sidebar ordering
-- Safe to re-run: uses IF NOT EXISTS

alter table public.threads
  add column if not exists is_pinned boolean not null default false,
  add column if not exists pinned_at timestamptz;

create index if not exists threads_user_pinned_last_message_idx
  on public.threads (
    user_id,
    is_pinned desc,
    pinned_at desc nulls last,
    last_message_at desc
  );
