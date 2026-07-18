alter table public.consultation_requests
  add column if not exists client_email_last_error text,
  add column if not exists internal_email_last_error text;
