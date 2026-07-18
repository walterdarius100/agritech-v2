alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

create index if not exists profiles_welcome_email_pending_idx
  on public.profiles(id)
  where welcome_email_sent_at is null;
