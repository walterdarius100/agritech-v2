alter table public.consultation_requests
  add column if not exists client_email_sent_at timestamptz,
  add column if not exists internal_email_sent_at timestamptz;

create index if not exists consultation_requests_client_email_sent_at_idx
  on public.consultation_requests (client_email_sent_at);

create index if not exists consultation_requests_internal_email_sent_at_idx
  on public.consultation_requests (internal_email_sent_at);
