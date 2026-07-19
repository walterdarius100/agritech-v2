alter table public.academy_certificates
  add column if not exists certificate_email_sent_at timestamptz;

create index if not exists academy_certificates_certificate_email_sent_at_idx
  on public.academy_certificates(certificate_email_sent_at);
