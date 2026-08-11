-- Private Storage support for event lead-magnet files. Existing external URLs
-- remain valid fallbacks, so this migration is deliberately non-destructive.
alter table public.event_resources
  add column if not exists storage_bucket text null,
  add column if not exists storage_path text null,
  add column if not exists file_mime_type text null,
  add column if not exists file_size bigint null;

alter table public.event_resources
  alter column file_url drop not null;

alter table public.event_resources
  drop constraint if exists event_resources_file_url_not_blank_check;

alter table public.event_resources
  add constraint event_resources_file_url_not_blank_check
    check (file_url is null or btrim(file_url) <> ''),
  add constraint event_resources_storage_pair_check
    check ((storage_bucket is null) = (storage_path is null)),
  add constraint event_resources_file_size_check
    check (file_size is null or file_size > 0);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-resources',
  'event-resources',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No storage.objects policy is intentional: only the server-side service role
-- may upload, list or sign objects from this private bucket.
