-- Fix: PL/pgSQL variable "current_role" shadows built-in current_role() (returns name)

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

revoke all on function public.admin_update_user_role(uuid, text) from public;
grant execute on function public.admin_update_user_role(uuid, text) to authenticated;

notify pgrst, 'reload schema';
