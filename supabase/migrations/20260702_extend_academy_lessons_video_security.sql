alter table public.academy_lessons
  add column if not exists video_provider text,
  add column if not exists video_uid text,
  add column if not exists video_embed_url text;

create index if not exists academy_lessons_video_uid_idx
  on public.academy_lessons (video_uid);
