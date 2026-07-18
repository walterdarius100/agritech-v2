alter table public.consultation_requests
  add column if not exists client_email_message_id text,
  add column if not exists internal_email_message_id text,
  add column if not exists email_last_attempt_at timestamptz,
  add column if not exists email_last_error text,
  add column if not exists client_email_processing_at timestamptz,
  add column if not exists internal_email_processing_at timestamptz;

create index if not exists consultation_requests_email_last_attempt_at_idx
  on public.consultation_requests (email_last_attempt_at desc);

create index if not exists consultation_requests_client_email_processing_at_idx
  on public.consultation_requests (client_email_processing_at);

create index if not exists consultation_requests_internal_email_processing_at_idx
  on public.consultation_requests (internal_email_processing_at);
