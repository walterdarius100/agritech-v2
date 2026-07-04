-- Non-destructive adjustment of existing academy_certificates table for Academy certificate workflow.
alter table public.academy_certificates
  add column if not exists enrollment_id uuid null references public.academy_enrollments(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.academy_certificates set status = 'valid' where status = 'issued';
update public.academy_certificates set status = 'draft' where status = 'expired';

alter table public.academy_certificates drop constraint if exists academy_certificates_status_check;
alter table public.academy_certificates
  add constraint academy_certificates_status_check check (status in ('valid','revoked','draft'));

create unique index if not exists academy_certificates_enrollment_id_key
  on public.academy_certificates(enrollment_id)
  where enrollment_id is not null;

create index if not exists academy_certificates_student_course_idx
  on public.academy_certificates(student_id, course_id);

create index if not exists academy_certificates_status_idx
  on public.academy_certificates(status);

drop policy if exists "Public can verify issued certificates" on public.academy_certificates;
drop policy if exists "Public can verify public certificates" on public.academy_certificates;
create policy "Public can verify public certificates"
  on public.academy_certificates
  for select to anon, authenticated
  using (status in ('valid','revoked'));
