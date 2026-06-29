import { articles as staticArticles } from "@/data/articles";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Article } from "@/types/article";

const ARTICLES_COLUMNS =
  "id,title,slug,category,excerpt,cover_image_url,author,content,status,featured,reading_time,published_at,created_at,updated_at";

function sortByPublicationDate(first: Article, second: Article) {
  return (
    new Date(second.published_at ?? second.created_at).getTime() -
    new Date(first.published_at ?? first.created_at).getTime()
  );
}

function getStaticPublishedArticles() {
  return staticArticles
    .filter((article) => article.status === "published")
    .sort(sortByPublicationDate);
}

function shouldUseStaticFallback() {
  if (!hasSupabasePublicConfig) {
    console.warn(
      "Supabase public config is missing. Using static articles fallback.",
    );
    return true;
  }

  return false;
}

async function fetchPublishedArticlesFromSupabase() {
  const supabase = createSupabaseServerClient();

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLES_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Unable to fetch published articles from Supabase",
      error.message,
    );
    return null;
  }

  return (data ?? []) as Article[];
}

export async function getPublishedArticles() {
  if (shouldUseStaticFallback()) {
    return getStaticPublishedArticles();
  }

  const articles = await fetchPublishedArticlesFromSupabase();

  return articles ?? getStaticPublishedArticles();
}

export async function getFeaturedArticle() {
  const articles = await getPublishedArticles();

  return articles.find((article) => article.featured) ?? articles[0] ?? null;
}

export async function getLatestArticles(limit = 3) {
  const articles = await getPublishedArticles();

  return articles.slice(0, limit);
}

export async function getRelatedArticles(currentSlug: string, limit = 3) {
  const articles = await getPublishedArticles();

  return articles
    .filter((article) => article.slug !== currentSlug)
    .slice(0, limit);
}

export function getArticleImage(article: Article) {
  return article.cover_image_url || "/images/services/pepiniere.jpg";
}

export function formatArticleDate(date: string | null) {
  if (!date) return "Date à confirmer";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getArticleReadingTime(article: Article) {
  if (article.reading_time) return article.reading_time;

  const wordCount = article.content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  return `${minutes} min de lecture`;
}

export function splitArticleContent(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
