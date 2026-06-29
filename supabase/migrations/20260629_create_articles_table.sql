create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  excerpt text not null,
  cover_image_url text,
  author text not null default 'Agri-tech',
  content text not null,
  status text not null default 'draft',
  featured boolean not null default false,
  reading_time text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_status_check check (status in ('draft', 'published', 'archived'))
);

create index if not exists articles_status_published_at_idx on public.articles (status, published_at desc);
create index if not exists articles_slug_idx on public.articles (slug);
create index if not exists articles_featured_idx on public.articles (featured);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
on public.articles
for select
using (status = 'published');
