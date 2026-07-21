create sequence if not exists public.client_pipeline_case_code_seq;

create or replace function public.generate_client_pipeline_case_code()
returns text
language plpgsql
as $$
declare
  next_number bigint;
begin
  next_number := nextval('public.client_pipeline_case_code_seq');
  return 'AGT-CRM-' || to_char(now(), 'YYYY') || '-' || lpad(next_number::text, 4, '0');
end;
$$;

create or replace function public.set_client_pipeline_case_code()
returns trigger
language plpgsql
as $$
begin
  if new.case_code is null or btrim(new.case_code) = '' then
    new.case_code := public.generate_client_pipeline_case_code();
  end if;

  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.client_pipeline_cases (
  id uuid primary key default gen_random_uuid(),
  case_code text unique not null,
  source_type text not null default 'manual',
  source_id uuid,
  first_contact_at timestamptz not null default now(),
  client_name text not null,
  organization_name text,
  primary_contact text,
  phone text,
  email text,
  project_type text,
  location text,
  source text not null default 'manual',
  main_channel text,
  interest_level text not null default 'moyen',
  priority text not null default 'normale',
  status text not null default 'nouveau',
  next_action text,
  responsible text,
  meeting_date date,
  meeting_time time,
  meeting_confirmed boolean not null default false,
  post_meeting_decision text,
  proposal_sent_at date,
  proposed_amount_usd numeric(12,2),
  follow_up_1_at date,
  follow_up_2_at date,
  expected_close_at date,
  expected_decision text,
  last_interaction_at timestamptz,
  alert_follow_up boolean not null default false,
  outcome text not null default 'en_cours',
  next_action_at date,
  admin_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_pipeline_cases_source_type_check
    check (source_type in ('contact', 'consultation', 'manual')),
  constraint client_pipeline_cases_interest_level_check
    check (interest_level in ('faible', 'moyen', 'eleve', 'tres_eleve')),
  constraint client_pipeline_cases_priority_check
    check (priority in ('basse', 'normale', 'haute', 'urgente')),
  constraint client_pipeline_cases_status_check
    check (status in ('nouveau', 'a_qualifier', 'reunion_a_planifier', 'reunion_prevue', 'proposition_a_preparer', 'proposition_envoyee', 'relance_1', 'relance_2', 'gagne', 'perdu', 'en_attente', 'archive')),
  constraint client_pipeline_cases_outcome_check
    check (outcome in ('en_cours', 'gagne', 'perdu', 'abandonne', 'non_qualifie')),
  constraint client_pipeline_cases_source_id_required_for_source_check
    check (
      (source_type = 'manual' and source_id is null)
      or (source_type in ('contact', 'consultation') and source_id is not null)
    ),
  constraint client_pipeline_cases_client_name_not_blank
    check (btrim(client_name) <> ''),
  constraint client_pipeline_cases_case_code_not_blank
    check (btrim(case_code) <> ''),
  constraint client_pipeline_cases_proposed_amount_non_negative
    check (proposed_amount_usd is null or proposed_amount_usd >= 0),
  constraint client_pipeline_cases_email_format_check
    check (email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

create unique index if not exists client_pipeline_cases_source_unique_idx
  on public.client_pipeline_cases (source_type, source_id)
  where source_id is not null;

create index if not exists client_pipeline_cases_source_type_idx
  on public.client_pipeline_cases (source_type);

create index if not exists client_pipeline_cases_source_id_idx
  on public.client_pipeline_cases (source_id);

create index if not exists client_pipeline_cases_status_idx
  on public.client_pipeline_cases (status);

create index if not exists client_pipeline_cases_priority_idx
  on public.client_pipeline_cases (priority);

create index if not exists client_pipeline_cases_interest_level_idx
  on public.client_pipeline_cases (interest_level);

create index if not exists client_pipeline_cases_outcome_idx
  on public.client_pipeline_cases (outcome);

create index if not exists client_pipeline_cases_next_action_at_idx
  on public.client_pipeline_cases (next_action_at);

create index if not exists client_pipeline_cases_last_interaction_at_idx
  on public.client_pipeline_cases (last_interaction_at);

create index if not exists client_pipeline_cases_created_at_idx
  on public.client_pipeline_cases (created_at desc);

create index if not exists client_pipeline_cases_email_idx
  on public.client_pipeline_cases (email);

create index if not exists client_pipeline_cases_phone_idx
  on public.client_pipeline_cases (phone);

create index if not exists client_pipeline_cases_case_code_idx
  on public.client_pipeline_cases (case_code);

drop trigger if exists set_client_pipeline_cases_case_code on public.client_pipeline_cases;
create trigger set_client_pipeline_cases_case_code
  before insert on public.client_pipeline_cases
  for each row
  execute function public.set_client_pipeline_case_code();

drop trigger if exists set_client_pipeline_cases_updated_at on public.client_pipeline_cases;
create trigger set_client_pipeline_cases_updated_at
  before update on public.client_pipeline_cases
  for each row
  execute function public.set_updated_at();

alter table public.client_pipeline_cases enable row level security;

drop policy if exists "No public client pipeline case access" on public.client_pipeline_cases;
create policy "No public client pipeline case access"
  on public.client_pipeline_cases
  for select
  to anon, authenticated
  using (false);
