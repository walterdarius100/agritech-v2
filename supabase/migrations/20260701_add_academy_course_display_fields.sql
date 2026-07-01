alter table public.academy_courses
  add column if not exists certification_description text,
  add column if not exists instructor_name text,
  add column if not exists instructor_role text,
  add column if not exists instructor_bio text,
  add column if not exists instructor_image_url text;
