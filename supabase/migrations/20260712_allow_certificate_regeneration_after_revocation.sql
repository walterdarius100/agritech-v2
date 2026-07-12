drop index if exists public.academy_certificates_enrollment_unique_idx;
create unique index if not exists academy_certificates_active_enrollment_unique_idx
on public.academy_certificates(enrollment_id)
where enrollment_id is not null and status in ('valid', 'draft');
