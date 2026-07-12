alter table public.academy_certificates
  add column if not exists enrollment_id uuid,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'academy_certificates_enrollment_id_fkey'
      and conrelid = 'public.academy_certificates'::regclass
  ) then
    alter table public.academy_certificates
      add constraint academy_certificates_enrollment_id_fkey
      foreign key (enrollment_id)
      references public.academy_enrollments(id)
      on delete set null;
  end if;
end $$;

alter table public.academy_certificates
  drop constraint if exists academy_certificates_status_check;

alter table public.academy_certificates
  add constraint academy_certificates_status_check
  check (status in ('issued','valid','draft','revoked','expired'));

create index if not exists academy_certificates_enrollment_idx
  on public.academy_certificates(enrollment_id);

create unique index if not exists academy_certificates_active_enrollment_unique_idx
  on public.academy_certificates(enrollment_id)
  where enrollment_id is not null and status in ('issued','valid','draft');

drop policy if exists "Public can verify issued certificates" on public.academy_certificates;
create policy "Public can verify issued certificates"
  on public.academy_certificates
  for select
  to anon, authenticated
  using (status in ('issued','valid'));
