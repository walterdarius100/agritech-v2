create extension if not exists pgcrypto;

create table if not exists public.academy_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.academy_courses(id) on delete cascade,
  enrollment_id uuid references public.academy_enrollments(id) on delete set null,
  student_full_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  status text not null default 'draft',
  verification_url text,
  qr_code_url text,
  pdf_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.academy_certificates add column if not exists enrollment_id uuid references public.academy_enrollments(id) on delete set null;
alter table public.academy_certificates add column if not exists qr_code_url text;
alter table public.academy_certificates add column if not exists pdf_url text;
alter table public.academy_certificates add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.academy_certificates set status = 'valid' where status = 'issued';
update public.academy_certificates set status = 'draft' where status = 'expired';

alter table public.academy_certificates drop constraint if exists academy_certificates_status_check;
alter table public.academy_certificates add constraint academy_certificates_status_check check (status in ('valid','revoked','draft'));

create unique index if not exists academy_certificates_enrollment_unique_idx on public.academy_certificates(enrollment_id) where enrollment_id is not null;
create index if not exists academy_certificates_student_idx on public.academy_certificates(student_id);
create index if not exists academy_certificates_course_idx on public.academy_certificates(course_id);
create index if not exists academy_certificates_status_idx on public.academy_certificates(status);
create index if not exists academy_certificates_issued_at_idx on public.academy_certificates(issued_at desc);

alter table public.academy_certificates enable row level security;

drop policy if exists "Students can read own certificates" on public.academy_certificates;
create policy "Students can read own certificates" on public.academy_certificates for select to authenticated using (student_id = auth.uid());

drop policy if exists "Public can verify issued certificates" on public.academy_certificates;
drop policy if exists "Public can verify academy certificates" on public.academy_certificates;
create policy "Public can verify academy certificates" on public.academy_certificates for select to anon, authenticated using (true);
