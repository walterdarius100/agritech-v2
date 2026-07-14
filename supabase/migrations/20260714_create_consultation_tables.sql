create sequence if not exists public.consultation_request_code_seq;

create or replace function public.generate_consultation_request_code()
returns text
language plpgsql
as $$
declare
  next_number bigint;
begin
  next_number := nextval('public.consultation_request_code_seq');
  return 'CONS-' || to_char(now(), 'YYYY') || '-' || lpad(next_number::text, 4, '0');
end;
$$;

create or replace function public.set_consultation_request_code()
returns trigger
language plpgsql
as $$
begin
  if new.request_code is null or btrim(new.request_code) = '' then
    new.request_code := public.generate_consultation_request_code();
  end if;

  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text unique not null,
  full_name text not null,
  email text,
  phone text not null,
  department text,
  commune text,
  consultation_type text not null,
  project_stage text,
  project_description text not null,
  estimated_budget text,
  consultation_mode text,
  consultation_package text not null,
  amount numeric(12,2) not null default 2500,
  currency text not null default 'HTG',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  request_status text not null default 'pending_payment' check (request_status in ('pending_payment', 'paid', 'scheduled', 'completed', 'cancelled', 'failed_payment')),
  paid_at timestamptz,
  scheduled_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consultation_requests_amount_non_negative check (amount >= 0),
  constraint consultation_requests_currency_not_blank check (btrim(currency) <> ''),
  constraint consultation_requests_full_name_not_blank check (btrim(full_name) <> ''),
  constraint consultation_requests_phone_not_blank check (btrim(phone) <> ''),
  constraint consultation_requests_type_not_blank check (btrim(consultation_type) <> ''),
  constraint consultation_requests_description_not_blank check (btrim(project_description) <> ''),
  constraint consultation_requests_package_not_blank check (btrim(consultation_package) <> '')
);

create table if not exists public.consultation_payments (
  id uuid primary key default gen_random_uuid(),
  consultation_request_id uuid not null references public.consultation_requests(id) on delete cascade,
  provider text not null check (provider in ('mock', 'moncash', 'natcash', 'manual')),
  provider_transaction_id text,
  amount numeric(12,2) not null,
  currency text not null default 'HTG',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_method text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint consultation_payments_amount_non_negative check (amount >= 0),
  constraint consultation_payments_currency_not_blank check (btrim(currency) <> '')
);

create index if not exists consultation_requests_request_code_idx
  on public.consultation_requests (request_code);

create index if not exists consultation_requests_payment_status_created_at_idx
  on public.consultation_requests (payment_status, created_at desc);

create index if not exists consultation_requests_request_status_created_at_idx
  on public.consultation_requests (request_status, created_at desc);

create index if not exists consultation_requests_consultation_type_idx
  on public.consultation_requests (consultation_type);

create index if not exists consultation_payments_request_id_idx
  on public.consultation_payments (consultation_request_id);

create index if not exists consultation_payments_status_idx
  on public.consultation_payments (status);

create index if not exists consultation_payments_provider_transaction_id_idx
  on public.consultation_payments (provider_transaction_id);

drop trigger if exists set_consultation_requests_request_code on public.consultation_requests;
create trigger set_consultation_requests_request_code
  before insert on public.consultation_requests
  for each row
  execute function public.set_consultation_request_code();

drop trigger if exists set_consultation_requests_updated_at on public.consultation_requests;
create trigger set_consultation_requests_updated_at
  before update on public.consultation_requests
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_consultation_payments_updated_at on public.consultation_payments;
create trigger set_consultation_payments_updated_at
  before update on public.consultation_payments
  for each row
  execute function public.set_updated_at();

alter table public.consultation_requests enable row level security;
alter table public.consultation_payments enable row level security;
