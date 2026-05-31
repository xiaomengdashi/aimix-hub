-- Fix: UPDATE SET role = ... still parses "role" as session role (name type)

create or replace function public.admin_update_user_role(
  target_user_id uuid,
  next_role public.app_user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role public.app_user_role;
  admin_count integer;
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  select up.role
  into current_role
  from public.user_profiles up
  where up.id = target_user_id;

  if current_role is null then
    raise exception '用户不存在';
  end if;

  if current_role = next_role then
    return;
  end if;

  if current_role = 'admin'::public.app_user_role
    and next_role = 'user'::public.app_user_role
    and target_user_id = auth.uid() then
    raise exception '不能将自己的角色降为普通用户';
  end if;

  if current_role = 'admin'::public.app_user_role
    and next_role = 'user'::public.app_user_role then
    select count(*)::integer
    into admin_count
    from public.user_profiles up
    where up.role = 'admin'::public.app_user_role;

    if admin_count <= 1 then
      raise exception '至少需要保留一名管理员';
    end if;
  end if;

  update public.user_profiles up
  set "role" = next_role
  where up.id = target_user_id;
end;
$$;

revoke all on function public.admin_update_user_role(uuid, public.app_user_role) from public;
grant execute on function public.admin_update_user_role(uuid, public.app_user_role) to authenticated;
