-- Model billing (models.dev style): USD per 1M input / output tokens

alter table public.model_catalog
  add column if not exists input_price_per_million numeric,
  add column if not exists output_price_per_million numeric;

drop function if exists public.admin_list_model_catalog();
drop function if exists public.admin_save_model_catalog(jsonb);
drop function if exists public.server_read_model_catalog(text, boolean);

create or replace function public.admin_list_model_catalog()
returns table (
  model_id text,
  ui_provider text,
  enabled boolean,
  sort_order int,
  name text,
  description text,
  context_window int,
  backend text,
  api_model text,
  input_price_per_million numeric,
  output_price_per_million numeric,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
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
    mc.api_model,
    mc.input_price_per_million,
    mc.output_price_per_million,
    mc.updated_at
  from public.model_catalog mc
  order by mc.ui_provider asc, mc.sort_order asc, mc.model_id asc;
end;
$$;

create or replace function public.admin_save_model_catalog(p_models jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  ids text[] := array[]::text[];
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  if p_models is null or jsonb_typeof(p_models) <> 'array' then
    raise exception '无效的模型列表';
  end if;

  for item in select value from jsonb_array_elements(p_models)
  loop
    ids := array_append(ids, item ->> 'modelId');
  end loop;

  delete from public.model_catalog
  where not (model_id = any (ids));

  for item in select value from jsonb_array_elements(p_models)
  loop
    insert into public.model_catalog (
      model_id,
      ui_provider,
      enabled,
      sort_order,
      name,
      description,
      context_window,
      backend,
      api_model,
      input_price_per_million,
      output_price_per_million,
      updated_at
    )
    values (
      item ->> 'modelId',
      item ->> 'uiProvider',
      coalesce((item ->> 'enabled')::boolean, true),
      coalesce((item ->> 'sortOrder')::int, 0),
      item ->> 'name',
      coalesce(item ->> 'description', ''),
      coalesce((item ->> 'contextWindow')::int, 200000),
      item ->> 'backend',
      item ->> 'apiModel',
      nullif(item ->> 'inputPricePerMillion', '')::numeric,
      nullif(item ->> 'outputPricePerMillion', '')::numeric,
      now()
    )
    on conflict (model_id) do update set
      ui_provider = excluded.ui_provider,
      enabled = excluded.enabled,
      sort_order = excluded.sort_order,
      name = excluded.name,
      description = excluded.description,
      context_window = excluded.context_window,
      backend = excluded.backend,
      api_model = excluded.api_model,
      input_price_per_million = excluded.input_price_per_million,
      output_price_per_million = excluded.output_price_per_million,
      updated_at = now();
  end loop;
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
  api_model text,
  input_price_per_million numeric,
  output_price_per_million numeric
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
    mc.api_model,
    mc.input_price_per_million,
    mc.output_price_per_million
  from public.model_catalog mc
  where not p_enabled_only or mc.enabled = true
  order by mc.ui_provider asc, mc.sort_order asc, mc.model_id asc;
end;
$$;

grant execute on function public.admin_list_model_catalog() to authenticated;
grant execute on function public.admin_save_model_catalog(jsonb) to authenticated;
grant execute on function public.server_read_model_catalog(text, boolean) to anon, authenticated, service_role;
