-- One-shot bootstrap for user roles + admin user management.
-- Run this if user_profiles does not exist yet (006 was never applied).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / ON CONFLICT.

do $$
begin
  create type public.app_user_role as enum ('admin', 'user');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'user_profiles'
  ) then
    create table public.user_profiles (
      id uuid primary key references auth.users (id) on delete cascade,
      app_role public.app_user_role not null default 'user',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'role'
  ) then
    alter table public.user_profiles rename column role to app_role;
  elsif not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'app_role'
  ) then
    alter table public.user_profiles
      add column app_role public.app_user_role not null default 'user';
  end if;
end $$;

alter table public.user_profiles enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
      and up.app_role = 'admin'::public.app_user_role
  );
$$;

insert into public.user_profiles (id, app_role)
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
  insert into public.user_profiles (id, app_role)
  values (new.id, 'user'::public.app_user_role)
  on conflict (id) do nothing;
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

drop function if exists public.admin_list_users();

create function public.admin_list_users()
returns table (
  id uuid,
  username text,
  role public.app_user_role,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  return query
  select
    u.id,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'username'), ''),
      case
        when u.email like '%@app.claude-clone.auth'
          then split_part(u.email, '@', 1)
        else coalesce(split_part(u.email, '@', 1), '用户')
      end
    ) as username,
    coalesce(up.app_role, 'user'::public.app_user_role) as role,
    u.created_at,
    u.last_sign_in_at
  from auth.users u
  left join public.user_profiles up on up.id = u.id
  order by username asc;
end;
$$;

drop function if exists public.admin_update_user_role(uuid, public.app_user_role);
drop function if exists public.admin_update_user_role(uuid, text);

create function public.admin_update_user_role(
  target_user_id uuid,
  p_app_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_desired_role public.app_user_role;
  v_existing_role public.app_user_role;
  v_admin_count integer;
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  if p_app_role not in ('admin', 'user') then
    raise exception '无效的角色';
  end if;

  v_desired_role := p_app_role::public.app_user_role;

  select up.app_role
  into v_existing_role
  from public.user_profiles up
  where up.id = target_user_id;

  if v_existing_role is null then
    raise exception '用户不存在';
  end if;

  if v_existing_role = v_desired_role then
    return;
  end if;

  if v_existing_role = 'admin'::public.app_user_role
    and v_desired_role = 'user'::public.app_user_role
    and target_user_id = auth.uid() then
    raise exception '不能将自己的角色降为普通用户';
  end if;

  if v_existing_role = 'admin'::public.app_user_role
    and v_desired_role = 'user'::public.app_user_role then
    select count(*)::integer
    into v_admin_count
    from public.user_profiles up
    where up.app_role = 'admin'::public.app_user_role;

    if v_admin_count <= 1 then
      raise exception '至少需要保留一名管理员';
    end if;
  end if;

  update public.user_profiles up
  set app_role = v_desired_role
  where up.id = target_user_id;
end;
$$;

revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_update_user_role(uuid, text) from public;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_update_user_role(uuid, text) to authenticated;

drop function if exists public.admin_delete_user(uuid);

create function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_existing_role public.app_user_role;
  v_admin_count integer;
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  if target_user_id = auth.uid() then
    raise exception '不能删除自己的账号';
  end if;

  if not exists (select 1 from auth.users u where u.id = target_user_id) then
    raise exception '用户不存在';
  end if;

  select up.app_role
  into v_existing_role
  from public.user_profiles up
  where up.id = target_user_id;

  if v_existing_role = 'admin'::public.app_user_role then
    select count(*)::integer
    into v_admin_count
    from public.user_profiles up
    where up.app_role = 'admin'::public.app_user_role;

    if v_admin_count <= 1 then
      raise exception '至少需要保留一名管理员';
    end if;
  end if;

  delete from auth.users u where u.id = target_user_id;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;

notify pgrst, 'reload schema';
