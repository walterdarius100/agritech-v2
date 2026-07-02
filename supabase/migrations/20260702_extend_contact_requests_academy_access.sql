alter table public.contact_requests
  add column if not exists course_slug text,
  add column if not exists course_title text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.contact_requests
  drop constraint if exists contact_requests_request_type_check;

alter table public.contact_requests
  add constraint contact_requests_request_type_check
  check (request_type in ('general', 'service', 'formation', 'academy_access', 'partnership', 'other'));

create index if not exists contact_requests_course_slug_idx
  on public.contact_requests (course_slug);
