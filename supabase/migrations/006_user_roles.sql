-- User roles: admin (管理员) and user (普通用户)
-- Existing users become admin; new signups default to user via trigger.

create type public.app_user_role as enum ('admin', 'user');

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'admin'::public.app_user_role
  );
$$;

-- Backfill: all existing users are admins
insert into public.user_profiles (id, role)
select id, 'admin'::public.app_user_role
from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, role)
  values (new.id, 'user'::public.app_user_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
  on public.user_profiles for select
  using (public.is_admin());

drop policy if exists "Admins can update profiles" on public.user_profiles;
create policy "Admins can update profiles"
  on public.user_profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row
  execute function public.set_updated_at();
