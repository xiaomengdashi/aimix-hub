-- Admin delete user (cascades to profiles, threads, messages)

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
