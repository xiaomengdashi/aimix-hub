-- Model catalog + integration settings (AI gateway & Tavily)

create table if not exists public.integration_settings (
  id int primary key check (id = 1),
  ai_base_url text not null default 'https://yunwu.ai/v1',
  ai_api_key text not null default '',
  tavily_api_key text not null default '',
  tavily_base_url text not null default 'https://api.tavily.com',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.integration_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.model_catalog (
  model_id text primary key,
  ui_provider text not null check (
    ui_provider in ('chatgpt', 'claude', 'gemini', 'other', 'image')
  ),
  enabled boolean not null default true,
  sort_order int not null default 0,
  name text not null,
  description text not null default '',
  context_window int not null default 200000,
  backend text not null check (backend in ('openai', 'anthropic', 'google')),
  api_model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.integration_settings enable row level security;
alter table public.model_catalog enable row level security;

create or replace function public.mask_secret(p_secret text)
returns text
language sql
immutable
as $$
  select case
    when coalesce(trim(p_secret), '') = '' then null
    when length(trim(p_secret)) <= 4 then '****'
    else '••••' || right(trim(p_secret), 4)
  end;
$$;

create or replace function public.admin_get_integration_settings()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  row public.integration_settings;
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  select * into row from public.integration_settings where id = 1;

  if row.id is null then
    return jsonb_build_object(
      'aiBaseUrl', 'https://yunwu.ai/v1',
      'aiApiKeyConfigured', false,
      'aiApiKeyHint', null,
      'tavilyApiKeyConfigured', false,
      'tavilyApiKeyHint', null,
      'tavilyBaseUrl', 'https://api.tavily.com',
      'updatedAt', null
    );
  end if;

  return jsonb_build_object(
    'aiBaseUrl', row.ai_base_url,
    'aiApiKeyConfigured', coalesce(trim(row.ai_api_key), '') <> '',
    'aiApiKeyHint', public.mask_secret(row.ai_api_key),
    'tavilyApiKeyConfigured', coalesce(trim(row.tavily_api_key), '') <> '',
    'tavilyApiKeyHint', public.mask_secret(row.tavily_api_key),
    'tavilyBaseUrl', row.tavily_base_url,
    'updatedAt', row.updated_at
  );
end;
$$;

create or replace function public.admin_update_integration_settings(
  p_ai_base_url text,
  p_ai_api_key text default null,
  p_tavily_api_key text default null,
  p_tavily_base_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.integration_settings;
begin
  if not public.is_admin() then
    raise exception '无权访问';
  end if;

  select * into current_row from public.integration_settings where id = 1 for update;

  if current_row.id is null then
    insert into public.integration_settings (id) values (1);
    select * into current_row from public.integration_settings where id = 1 for update;
  end if;

  update public.integration_settings
  set
    ai_base_url = coalesce(nullif(trim(p_ai_base_url), ''), current_row.ai_base_url),
    ai_api_key = case
      when p_ai_api_key is null then current_row.ai_api_key
      else trim(p_ai_api_key)
    end,
    tavily_api_key = case
      when p_tavily_api_key is null then current_row.tavily_api_key
      else trim(p_tavily_api_key)
    end,
    tavily_base_url = coalesce(
      nullif(trim(p_tavily_base_url), ''),
      current_row.tavily_base_url
    ),
    updated_at = now(),
    updated_by = auth.uid()
  where id = 1;

  return public.admin_get_integration_settings();
end;
$$;

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
      updated_at = now();
  end loop;
end;
$$;

-- Bootstrap catalog from legacy fallback list when empty
insert into public.model_catalog (
  model_id, ui_provider, enabled, sort_order, name, description, context_window, backend, api_model
)
select *
from (
  values
    ('gpt-5.5', 'chatgpt', true, 0, 'GPT-5.5', '旗舰对话，综合能力强', 256000, 'openai', 'gpt-5.5'),
    ('gpt-5.4-pro', 'chatgpt', true, 1, 'GPT-5.4 Pro', '更强推理，适合复杂问题', 256000, 'openai', 'gpt-5.4-pro'),
    ('gpt-5.4-mini', 'chatgpt', true, 2, 'GPT-5.4 Mini', '更快更省，适合日常对话', 256000, 'openai', 'gpt-5.4-mini'),
    ('gpt-5.3-chat', 'chatgpt', true, 3, 'GPT-5.3 Chat', '对话优化，响应顺滑', 200000, 'openai', 'gpt-5.3-chat'),
    ('gpt-5.2-chat', 'chatgpt', true, 4, 'GPT-5.2 Chat', '稳定对话，性价比高', 200000, 'openai', 'gpt-5.2-chat'),
    ('gpt-image-2', 'image', true, 0, 'GPT Image 2', '文生图，输入描述即可生成图像', 0, 'anthropic', 'gpt-image-2'),
    ('claude-sonnet-4-6', 'claude', true, 0, 'Sonnet 4.6', '均衡：聪明、快速，适合日常使用', 200000, 'anthropic', 'claude-sonnet-4-6'),
    ('claude-opus-4-7', 'claude', true, 1, 'Opus 4.7', '最强能力，适合复杂任务', 200000, 'anthropic', 'claude-opus-4-7'),
    ('claude-haiku-4-5-20251001', 'claude', true, 2, 'Haiku 4.5', '最快、最省，适合简单对话', 200000, 'anthropic', 'claude-haiku-4-5-20251001'),
    ('claude-sonnet-4-5', 'claude', true, 3, 'Sonnet 4.5', '均衡实用，适合日常对话', 200000, 'anthropic', 'claude-sonnet-4-5'),
    ('claude-opus-4-6', 'claude', true, 4, 'Opus 4.6', '强推理能力，适合复杂任务', 200000, 'anthropic', 'claude-opus-4-6'),
    ('gemini-3.1-pro-preview', 'gemini', true, 0, 'Gemini 3.1 Pro Preview', '预览旗舰，复杂推理', 1000000, 'openai', 'gemini-3.1-pro-preview'),
    ('gemini-3.1-flash-preview', 'gemini', true, 1, 'Gemini 3.1 Flash Preview', '快速预览，日常首选', 1000000, 'openai', 'gemini-3.1-flash-preview'),
    ('gemini-2.5-pro', 'gemini', true, 2, 'Gemini 2.5 Pro', '复杂推理与长文档', 1000000, 'openai', 'gemini-2.5-pro'),
    ('gemini-3-flash-preview', 'gemini', true, 3, 'Gemini 3 Flash Preview', '轻量预览，低延迟', 1000000, 'openai', 'gemini-3-flash-preview'),
    ('gemini-2.5-flash', 'gemini', true, 4, 'Gemini 2.5 Flash', '默认推荐，快速且聪明', 1000000, 'openai', 'gemini-2.5-flash'),
    ('gemini-2.5-flash-lite', 'gemini', true, 5, 'Gemini 2.5 Flash Lite', '轻量快速', 1000000, 'openai', 'gemini-2.5-flash-lite'),
    ('deepseek-v4-pro', 'other', true, 0, 'DeepSeek V4 Pro', '旗舰推理，复杂任务', 128000, 'anthropic', 'deepseek-v4-pro'),
    ('deepseek-v4-flash', 'other', true, 1, 'DeepSeek V4 Flash', '快速响应，日常对话', 128000, 'anthropic', 'deepseek-v4-flash'),
    ('glm-5.1', 'other', true, 2, 'GLM-5.1', '智谱旗舰，中文出色', 128000, 'anthropic', 'glm-5.1'),
    ('MiniMax-M2.7', 'other', true, 3, 'MiniMax M2.7', '海螺新一代，综合均衡', 128000, 'anthropic', 'MiniMax-M2.7'),
    ('kimi-k2.5', 'other', true, 4, 'Kimi K2.5', '月之暗面，长文与推理', 128000, 'anthropic', 'kimi-k2.5'),
    ('qwen3.6-plus', 'other', true, 5, 'Qwen3.6', '通义旗舰，综合能力', 128000, 'anthropic', 'qwen3.6-plus'),
    ('mimo-v2.5-pro', 'other', true, 6, 'MiMo V2.5 Pro', '小米旗舰，推理增强', 128000, 'anthropic', 'mimo-v2.5-pro')
) as seed(model_id, ui_provider, enabled, sort_order, name, description, context_window, backend, api_model)
where not exists (select 1 from public.model_catalog limit 1);

grant execute on function public.admin_get_integration_settings() to authenticated;
grant execute on function public.admin_update_integration_settings(text, text, text, text) to authenticated;
grant execute on function public.admin_list_model_catalog() to authenticated;
grant execute on function public.admin_save_model_catalog(jsonb) to authenticated;
