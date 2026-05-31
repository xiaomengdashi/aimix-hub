-- Server-side secret reads when sb_secret_* service keys are unavailable.
-- Use SUPABASE_SERVER_READ_TOKEN in .env (copy from admin panel) OR legacy JWT service_role key.

alter table public.integration_settings
  add column if not exists server_read_token text;

update public.integration_settings
set server_read_token = coalesce(
  nullif(trim(server_read_token), ''),
  encode(gen_random_bytes(32), 'hex')
)
where id = 1;

insert into public.integration_settings (id, server_read_token)
select 1, encode(gen_random_bytes(32), 'hex')
where not exists (select 1 from public.integration_settings where id = 1);

create or replace function public.server_read_integration_settings(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  row public.integration_settings;
begin
  select * into row from public.integration_settings where id = 1;

  if row.id is null
    or coalesce(trim(p_token), '') = ''
    or row.server_read_token is distinct from trim(p_token) then
    raise exception '无权访问';
  end if;

  return jsonb_build_object(
    'aiBaseUrl', row.ai_base_url,
    'aiApiKey', row.ai_api_key,
    'tavilyApiKey', row.tavily_api_key,
    'tavilyBaseUrl', row.tavily_base_url,
    'updatedAt', row.updated_at
  );
end;
$$;

create or replace function public.server_read_model_catalog(
  p_token text,
  p_enabled_only boolean default true
)
returns table (
  model_id text,
  ui_provider text,
  enabled boolean,
  sort_order int,
  name text,
  description text,
  context_window int,
  backend text,
  api_model text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  row public.integration_settings;
begin
  select * into row from public.integration_settings where id = 1;

  if row.id is null
    or coalesce(trim(p_token), '') = ''
    or row.server_read_token is distinct from trim(p_token) then
    raise exception '无权访问';
  end if;

  return query
  select
    mc.model_id,
    mc.ui_provider,
    mc.enabled,
    mc.sort_order,
    mc.name,
    mc.description,
    mc.context_window,
    mc.backend,
    mc.api_model
  from public.model_catalog mc
  where not p_enabled_only or mc.enabled = true
  order by mc.ui_provider asc, mc.sort_order asc, mc.model_id asc;
end;
$$;

create or replace function public.admin_get_server_read_token()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  token text;
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  select server_read_token into token
  from public.integration_settings
  where id = 1;

  return token;
end;
$$;

grant execute on function public.server_read_integration_settings(text) to anon, authenticated, service_role;
grant execute on function public.server_read_model_catalog(text, boolean) to anon, authenticated, service_role;
grant execute on function public.admin_get_server_read_token() to authenticated;
