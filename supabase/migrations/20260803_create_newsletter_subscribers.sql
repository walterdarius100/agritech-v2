create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed', 'bounced', 'complained')),
  source text not null default 'footer',
  locale text,
  page_path text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_subscribers_status_subscribed_at_idx
  on public.newsletter_subscribers (status, subscribed_at desc);

create or replace function public.set_newsletter_subscriber_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_newsletter_subscriber_updated_at on public.newsletter_subscribers;
create trigger set_newsletter_subscriber_updated_at
  before update on public.newsletter_subscribers
  for each row
  execute function public.set_newsletter_subscriber_updated_at();

alter table public.newsletter_subscribers enable row level security;

-- No public policies are created. The server-only service-role client bypasses RLS;
-- anon and authenticated browser clients cannot select, insert, update, or delete rows.
