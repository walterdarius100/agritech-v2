import { articles as staticArticles } from "@/data/articles";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Article } from "@/types/article";

const ARTICLE_COLUMNS =
  "id,title,slug,category,excerpt,cover_image_url,author,content,status,featured,reading_time,published_at,created_at,updated_at";

function getStaticArticleBySlug(slug: string) {
  return (
    staticArticles.find(
      (article) => article.slug === slug && article.status === "published",
    ) ?? null
  );
}

export async function getArticleBySlug(slug: string) {
  if (!hasSupabasePublicConfig) {
    console.warn(
      `[articles] Supabase public config is missing. Using static article fallback for slug: ${slug}.`,
    );
    return getStaticArticleBySlug(slug);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    console.warn(
      `[articles] Unable to create Supabase server client. Using static article fallback for slug: ${slug}.`,
    );
    return getStaticArticleBySlug(slug);
  }

  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.warn(
      `[articles] Unable to fetch article from Supabase for slug ${slug}: ${error.message}. Using static article fallback.`,
    );
    return getStaticArticleBySlug(slug);
  }

  return (data as Article | null) ?? null;
}
