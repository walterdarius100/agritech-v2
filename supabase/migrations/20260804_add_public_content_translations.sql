-- Non-destructive editorial translations for public server content.
-- Existing columns remain the canonical French fallback and existing slugs
-- remain stable, preserving links, enrollments, certificates and payments.
alter table public.articles
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.academy_courses
  add column if not exists objectives text,
  add column if not exists target_audience text,
  add column if not exists program_summary text,
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.academy_modules
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.academy_lessons
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.academy_resources
  add column if not exists translations jsonb not null default '{}'::jsonb;

comment on column public.articles.translations is
  'Editorial translations keyed by fr/en/es; supported fields: title, category, excerpt, content, author, slug.';
comment on column public.academy_courses.translations is
  'Editorial translations keyed by fr/en/es; supported fields: title, category, short_description, description, objectives, target_audience, program_summary, duration, certification_description, instructor_role, instructor_bio.';

alter table public.articles
  add constraint articles_translations_object_check
  check (jsonb_typeof(translations) = 'object') not valid;
alter table public.academy_courses
  add constraint academy_courses_translations_object_check
  check (jsonb_typeof(translations) = 'object') not valid;
alter table public.academy_modules
  add constraint academy_modules_translations_object_check
  check (jsonb_typeof(translations) = 'object') not valid;
alter table public.academy_lessons
  add constraint academy_lessons_translations_object_check
  check (jsonb_typeof(translations) = 'object') not valid;
alter table public.academy_resources
  add constraint academy_resources_translations_object_check
  check (jsonb_typeof(translations) = 'object') not valid;
