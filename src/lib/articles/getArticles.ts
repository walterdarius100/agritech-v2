import { articles as staticArticles } from "@/data/articles";
import { hasSupabasePublicConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Article, SupabaseArticle } from "@/types/article";

const ARTICLES_COLUMNS =
  "id,title,slug,category,excerpt,cover_image_url,author,content,status,featured,reading_time,published_at,created_at,updated_at";

const ARTICLE_IMAGE_PLACEHOLDER = "/images/services/pepiniere.jpg";
const DEFAULT_READING_TIME = "3 min de lecture";

function getSortDate(article: Article) {
  return article.published_at ?? article.created_at;
}

function sortByPublicationDate(first: Article, second: Article) {
  return (
    new Date(getSortDate(second)).getTime() -
    new Date(getSortDate(first)).getTime()
  );
}

function hasValidSlug(article: Article) {
  return Boolean(article.slug?.trim());
}

export function mapArticleToViewModel(article: SupabaseArticle): Article {
  const createdAt = article.created_at ?? new Date(0).toISOString();

  return {
    id: String(article.id),
    title: article.title ?? "Article Agri-tech",
    slug: article.slug?.trim() ?? "",
    category: article.category ?? "Article",
    excerpt: article.excerpt ?? "",
    cover_image_url: article.cover_image_url ?? null,
    author: article.author ?? "Équipe Agri-tech",
    content: article.content ?? "",
    status: article.status,
    featured: Boolean(article.featured),
    reading_time: article.reading_time ?? DEFAULT_READING_TIME,
    published_at: article.published_at ?? null,
    created_at: createdAt,
    updated_at: article.updated_at ?? createdAt,
  };
}

function getStaticPublishedArticles() {
  return staticArticles
    .filter((article) => article.status === "published")
    .filter(hasValidSlug)
    .sort(sortByPublicationDate);
}

function shouldUseStaticFallback() {
  if (!hasSupabasePublicConfig) {
    console.warn(
      "[Articles] Supabase public config is missing. Using static articles fallback.",
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
      "[Articles] Unable to fetch published articles from Supabase",
      error.message,
    );
    return null;
  }

  const articles = ((data ?? []) as SupabaseArticle[])
    .map(mapArticleToViewModel)
    .filter(hasValidSlug)
    .sort(sortByPublicationDate);

  console.info(
    `[Articles] Supabase returned ${articles.length} published articles`,
  );

  return articles;
}

export async function getPublishedArticles() {
  if (shouldUseStaticFallback()) {
    const articles = getStaticPublishedArticles();
    console.info(
      `[Articles] Static fallback returned ${articles.length} published articles`,
    );
    return articles;
  }

  const articles = await fetchPublishedArticlesFromSupabase();

  return articles ?? getStaticPublishedArticles();
}

export async function getFeaturedArticle() {
  const articles = await getPublishedArticles();
  const featuredArticle =
    articles.find((article) => article.featured) ?? articles[0] ?? null;

  console.info(
    `[Articles] Featured article slug: ${featuredArticle?.slug ?? "none"}`,
  );

  return featuredArticle;
}

export async function getLatestArticles(limit = 3) {
  const articles = await getPublishedArticles();
  const latestArticles = articles.slice(0, limit);

  console.info(`[Articles] Latest articles count: ${latestArticles.length}`);

  return latestArticles;
}

export async function getRelatedArticles(currentSlug: string, limit = 3) {
  const articles = await getPublishedArticles();

  return articles
    .filter((article) => article.slug !== currentSlug)
    .slice(0, limit);
}

export function getArticleImage(article: Article) {
  return article.cover_image_url || ARTICLE_IMAGE_PLACEHOLDER;
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

export function getArticleDate(article: Article) {
  return article.published_at ?? article.created_at;
}

export function splitArticleContent(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
