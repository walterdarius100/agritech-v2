-- Storage bucket for admin article cover images.
-- The bucket is public for reads; uploads are performed only by the server-side
-- admin upload route with SUPABASE_SERVICE_ROLE_KEY after admin authorization.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read access for article images"
on storage.objects for select
to public
using (bucket_id = 'article-images');
