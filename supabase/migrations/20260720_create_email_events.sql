create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  related_entity_type text,
  related_entity_id uuid,
  recipient_email text not null,
  recipient_name text,
  subject text not null,
  provider text not null default 'brevo',
  provider_message_id text,
  status text not null default 'sent',
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint email_events_status_check check (status in ('sent', 'failed', 'skipped')),
  constraint email_events_type_check check (event_type in (
    'consultation_client_confirmation',
    'consultation_internal_notification',
    'contact_visitor_acknowledgement',
    'contact_internal_notification',
    'academy_welcome',
    'academy_purchase_confirmation',
    'academy_internal_purchase_notification',
    'certificate_available'
  ))
);

create index if not exists email_events_created_at_idx on public.email_events (created_at desc);
create index if not exists email_events_status_idx on public.email_events (status);
create index if not exists email_events_event_type_idx on public.email_events (event_type);
create index if not exists email_events_related_entity_idx on public.email_events (related_entity_type, related_entity_id);

alter table public.email_events enable row level security;

drop policy if exists "No public email event access" on public.email_events;
create policy "No public email event access"
  on public.email_events
  for select
  to anon, authenticated
  using (false);
