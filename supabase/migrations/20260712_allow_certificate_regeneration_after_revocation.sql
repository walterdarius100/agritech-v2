alter table public.academy_certificates
  add column if not exists enrollment_id uuid;

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

drop index if exists public.academy_certificates_enrollment_unique_idx;

create unique index if not exists academy_certificates_active_enrollment_unique_idx
on public.academy_certificates(enrollment_id)
where enrollment_id is not null and status in ('valid', 'draft');
