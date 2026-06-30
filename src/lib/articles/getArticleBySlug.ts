import { articles as staticArticles } from "@/data/articles";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getPublishedArticles,
  mapArticleToViewModel,
} from "@/lib/articles/getArticles";
import type { SupabaseArticle } from "@/types/article";

const ARTICLE_COLUMNS =
  "id,title,slug,category,excerpt,cover_image_url,author,content,status,featured,reading_time,published_at,created_at,updated_at";

function normalizeSlug(slug: string) {
  return decodeURIComponent(slug).trim().toLowerCase();
}

function getStaticArticleBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);

  return (
    staticArticles.find(
      (article) =>
        normalizeSlug(article.slug) === normalizedSlug &&
        article.status === "published",
    ) ?? null
  );
}

export async function getArticleBySlug(slug: string) {
  const requestedSlug = decodeURIComponent(slug).trim();

  console.info(`[ArticleBySlug] Requested slug: ${requestedSlug}`);

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
    .eq("slug", requestedSlug)
    .maybeSingle();

  if (error) {
    console.error("[ArticleBySlug] Supabase error:", error.message);
    return getStaticArticleBySlug(slug);
  }

  const article = data ? mapArticleToViewModel(data as SupabaseArticle) : null;

  if (article?.slug) {
    console.info("[ArticleBySlug] Found article: yes");
    return article;
  }

  const normalizedRequestedSlug = normalizeSlug(requestedSlug);
  const matchingArticle = (await getPublishedArticles()).find(
    (publishedArticle) =>
      normalizeSlug(publishedArticle.slug) === normalizedRequestedSlug,
  );

  console.info(
    `[ArticleBySlug] Found article: ${matchingArticle ? "yes" : "no"}`,
  );

  return matchingArticle ?? null;
}
