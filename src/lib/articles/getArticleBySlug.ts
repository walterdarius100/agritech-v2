import { articles as staticArticles } from "@/data/articles";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapArticleToViewModel } from "@/lib/articles/getArticles";
import type { SupabaseArticle } from "@/types/article";

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
      "[Articles] Supabase public config is missing. Using static article fallback.",
    );
    return getStaticArticleBySlug(slug);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) return getStaticArticleBySlug(slug);

  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(
      "[Articles] Unable to fetch article from Supabase",
      error.message,
    );
    return getStaticArticleBySlug(slug);
  }

  const article = data ? mapArticleToViewModel(data as SupabaseArticle) : null;

  console.info(
    `[Articles] Article by slug ${slug} ${article ? "found" : "not found"}`,
  );

  return article?.slug ? article : null;
}
