alter table public.academy_enrollments add column if not exists completed_at timestamptz;
create index if not exists academy_enrollments_completed_at_idx on public.academy_enrollments(completed_at desc) where completed_at is not null;
