-- Definitive fix: rename reserved column "role" -> "app_role"
-- and recreate admin RPC with text input (PostgREST-friendly)

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'role'
  ) then
    alter table public.user_profiles rename column role to app_role;
  end if;
end $$;

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

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, app_role)
  values (new.id, 'user'::public.app_user_role);
  return new;
end;
$$;

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
  validated_role public.app_user_role;
  current_role public.app_user_role;
  admin_count integer;
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  if p_app_role not in ('admin', 'user') then
    raise exception '无效的角色';
  end if;

  validated_role := p_app_role::public.app_user_role;

  select up.app_role
  into current_role
  from public.user_profiles up
  where up.id = target_user_id;

  if current_role is null then
    raise exception '用户不存在';
  end if;

  if current_role = validated_role then
    return;
  end if;

  if current_role = 'admin'::public.app_user_role
    and validated_role = 'user'::public.app_user_role
    and target_user_id = auth.uid() then
    raise exception '不能将自己的角色降为普通用户';
  end if;

  if current_role = 'admin'::public.app_user_role
    and validated_role = 'user'::public.app_user_role then
    select count(*)::integer
    into admin_count
    from public.user_profiles up
    where up.app_role = 'admin'::public.app_user_role;

    if admin_count <= 1 then
      raise exception '至少需要保留一名管理员';
    end if;
  end if;

  update public.user_profiles up
  set app_role = validated_role
  where up.id = target_user_id;
end;
$$;

revoke all on function public.admin_list_users() from public;
revoke all on function public.admin_update_user_role(uuid, text) from public;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_update_user_role(uuid, text) to authenticated;

notify pgrst, 'reload schema';
