alter table public.consultation_requests
  add constraint consultation_requests_email_required
  check (
    email is not null
    and btrim(email) <> ''
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) not valid;
