create table if not exists public.event_resources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  resource_type text not null default 'document',
  file_url text not null,
  file_name text,
  event_name text,
  topic text,
  language text not null default 'fr',
  is_active boolean not null default true,
  requires_form boolean not null default true,
  download_button_label text not null default 'Télécharger la ressource',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint event_resources_slug_format_check
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint event_resources_title_not_blank_check check (btrim(title) <> ''),
  constraint event_resources_file_url_not_blank_check check (btrim(file_url) <> ''),
  constraint event_resources_download_label_not_blank_check check (btrim(download_button_label) <> ''),
  constraint event_resources_resource_type_check
    check (resource_type in ('document', 'plan', 'guide', 'fiche_technique', 'presentation', 'autre')),
  constraint event_resources_language_check check (language in ('fr', 'en', 'es', 'ht')),
  constraint event_resources_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

-- The unique constraint on slug already creates its lookup index.
create index if not exists event_resources_is_active_idx on public.event_resources (is_active);
create index if not exists event_resources_topic_idx on public.event_resources (topic);

create or replace function public.set_event_resource_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_event_resources_updated_at on public.event_resources;
create trigger set_event_resources_updated_at
  before update on public.event_resources
  for each row
  execute function public.set_event_resource_updated_at();

create table if not exists public.event_resource_leads (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.event_resources(id) on delete cascade,
  full_name text not null,
  phone text,
  email text not null,
  organization text,
  interest_area text,
  consent_newsletter boolean not null default false,
  consent_contact boolean not null default true,
  source text not null default 'qr_code',
  event_name text,
  page_path text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint event_resource_leads_full_name_not_blank_check check (btrim(full_name) <> ''),
  constraint event_resource_leads_email_format_check
    check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint event_resource_leads_source_not_blank_check check (btrim(source) <> ''),
  constraint event_resource_leads_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create index if not exists event_resource_leads_resource_id_idx on public.event_resource_leads (resource_id);
create index if not exists event_resource_leads_email_idx on public.event_resource_leads (email);
create index if not exists event_resource_leads_created_at_idx on public.event_resource_leads (created_at desc);
create index if not exists event_resource_leads_source_idx on public.event_resource_leads (source);
create index if not exists event_resource_leads_event_name_idx on public.event_resource_leads (event_name);

-- The future server endpoint must normalize email to lowercase. This expression
-- index also rejects duplicates that differ only by casing.
create unique index if not exists event_resource_leads_resource_email_unique_idx
  on public.event_resource_leads (resource_id, lower(email));

alter table public.event_resources enable row level security;
alter table public.event_resource_leads enable row level security;

-- There are intentionally no public policies. Future public and admin flows must
-- use the server-only service-role client after validating inputs/access.
revoke all on public.event_resources from anon;
revoke all on public.event_resources from authenticated;
revoke all on public.event_resource_leads from anon;
revoke all on public.event_resource_leads from authenticated;
