create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  organization text,
  request_type text not null default 'general' check (request_type in ('general', 'service', 'formation', 'partnership', 'other')),
  service_slug text,
  formation_slug text,
  subject text,
  message text not null,
  source_page text,
  status text not null default 'new' check (status in ('new', 'in_review', 'contacted', 'converted', 'closed', 'spam')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_requests_status_created_at_idx
  on public.contact_requests (status, created_at desc);

create index if not exists contact_requests_email_idx
  on public.contact_requests (email);

create index if not exists contact_requests_request_type_idx
  on public.contact_requests (request_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_contact_requests_updated_at on public.contact_requests;
create trigger set_contact_requests_updated_at
  before update on public.contact_requests
  for each row
  execute function public.set_updated_at();

alter table public.contact_requests enable row level security;

create policy "Public can create contact requests"
  on public.contact_requests
  for insert
  to anon
  with check (true);
