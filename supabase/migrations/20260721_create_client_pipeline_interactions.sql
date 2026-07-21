create table if not exists public.client_pipeline_interactions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.client_pipeline_cases(id) on delete cascade,
  interaction_type text not null default 'note',
  interaction_date timestamptz not null default now(),
  channel text,
  summary text not null,
  details text,
  created_by text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint client_pipeline_interactions_type_check
    check (interaction_type in ('note', 'appel', 'whatsapp', 'email', 'reunion', 'relance', 'proposition', 'paiement', 'decision', 'autre')),
  constraint client_pipeline_interactions_channel_check
    check (channel is null or channel in ('telephone', 'whatsapp', 'email', 'site_web', 'reunion_en_ligne', 'reunion_physique', 'facebook', 'instagram', 'autre')),
  constraint client_pipeline_interactions_summary_not_blank
    check (btrim(summary) <> '')
);

create index if not exists client_pipeline_interactions_case_id_idx
  on public.client_pipeline_interactions (case_id);

create index if not exists client_pipeline_interactions_case_date_idx
  on public.client_pipeline_interactions (case_id, interaction_date desc);

alter table public.client_pipeline_interactions enable row level security;

revoke all on public.client_pipeline_interactions from anon;
revoke all on public.client_pipeline_interactions from authenticated;
