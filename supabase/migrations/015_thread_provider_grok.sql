-- Grok as a first-class chat provider (threads + model catalog)

alter table public.threads
  drop constraint if exists threads_provider_check;

alter table public.threads
  add constraint threads_provider_check
  check (provider in ('claude', 'chatgpt', 'gemini', 'grok', 'other', 'image'));

alter table public.model_catalog
  drop constraint if exists model_catalog_ui_provider_check;

alter table public.model_catalog
  add constraint model_catalog_ui_provider_check
  check (ui_provider in ('chatgpt', 'claude', 'gemini', 'grok', 'other', 'image'));

insert into public.model_catalog (
  model_id, ui_provider, enabled, sort_order, name, description, context_window, backend, api_model
)
values
  ('grok-4.1-fast', 'grok', true, 0, 'Grok 4.1 Fast', '默认。快速响应', 256000, 'openai', 'grok-4.1-fast'),
  ('grok-4.1', 'grok', true, 1, 'Grok 4.1', '标准推理', 256000, 'openai', 'grok-4.1'),
  ('grok-4', 'grok', true, 2, 'Grok 4', '旗舰对话，综合能力强', 256000, 'openai', 'grok-4'),
  ('grok-3-mini', 'grok', true, 3, 'Grok 3 Mini', '更快更省，适合日常对话', 128000, 'openai', 'grok-3-mini')
on conflict (model_id) do nothing;
