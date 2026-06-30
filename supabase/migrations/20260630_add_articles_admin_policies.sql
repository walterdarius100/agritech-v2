-- Admin writes are performed server-side with SUPABASE_SERVICE_ROLE_KEY after
-- the Next.js admin guard validates the authenticated user's email against
-- ADMIN_EMAILS. The service role bypasses RLS and must never be exposed client-side.
-- Public article reads remain restricted by the existing published-only policy.

alter table public.articles enable row level security;
