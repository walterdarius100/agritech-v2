import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { mapArticleToViewModel } from "@/lib/articles/getArticles";
import type { Article, ArticleStatus, SupabaseArticle } from "@/types/article";

const ARTICLES_COLUMNS =
  "id,title,slug,category,excerpt,cover_image_url,author,content,status,featured,reading_time,published_at,created_at,updated_at";

export type ArticleFormState = { error?: string; success?: string };

const allowedStatuses: ArticleStatus[] = ["draft", "published", "archived"];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function trimEmptyHtmlBlocks(content: string) {
  return content
    .trim()
    .replace(
      /^(?:\s|<p>(?:&nbsp;|\s|<br\s*\/?>)*<\/p>|<div>(?:&nbsp;|\s|<br\s*\/?>)*<\/div>|<br\s*\/?>)+/gi,
      "",
    )
    .replace(
      /(?:\s|<p>(?:&nbsp;|\s|<br\s*\/?>)*<\/p>|<div>(?:&nbsp;|\s|<br\s*\/?>)*<\/div>|<br\s*\/?>)+$/gi,
      "",
    )
    .trim();
}

function sanitizeArticleContent(content: string) {
  return trimEmptyHtmlBlocks(
    content
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/\s(on\w+)="[^"]*"/gi, "")
      .replace(/\s(on\w+)='[^']*'/gi, "")
      .replace(/javascript:/gi, ""),
  );
}

function getAdminClientOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Configuration Supabase admin manquante.");
  return supabase;
}

function parseArticleForm(formData: FormData) {
  const intent = String(formData.get("intent") ?? "");
  const requestedStatus = String(
    formData.get("status") ?? "draft",
  ) as ArticleStatus;
  const status =
    intent === "draft"
      ? "draft"
      : intent === "publish"
        ? "published"
        : requestedStatus;
  const publishedAt = String(formData.get("published_at") ?? "").trim();
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase(),
    category: String(formData.get("category") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    cover_image_url:
      String(formData.get("cover_image_url") ?? "").trim() || null,
    author: String(formData.get("author") ?? "").trim() || "Agri-tech",
    content: sanitizeArticleContent(
      String(formData.get("content") ?? "").trim(),
    ),
    status,
    featured: formData.get("featured") === "on",
    reading_time:
      String(formData.get("reading_time") ?? "").trim() || "3 min de lecture",
    published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
  };

  if (!payload.title) return { error: "Le titre est requis." };
  if (!payload.slug) return { error: "Le slug est requis." };
  if (!slugPattern.test(payload.slug)) {
    return {
      error: "Le slug doit contenir uniquement minuscules, chiffres et tirets.",
    };
  }
  if (!payload.category) return { error: "La catégorie est requise." };
  if (!payload.excerpt) return { error: "L’extrait est requis." };
  if (!payload.content) return { error: "Le contenu est requis." };
  if (!allowedStatuses.includes(payload.status))
    return { error: "Statut invalide." };

  if (payload.status === "published" && !payload.published_at) {
    payload.published_at = new Date().toISOString();
  }

  return { payload };
}

async function ensureSingleFeatured(currentId: string) {
  const supabase = getAdminClientOrThrow();
  const { error } = await supabase
    .from("articles")
    .update({ featured: false })
    .neq("id", currentId);

  if (error) throw new Error(error.message);
}

export async function getAdminArticles(status?: ArticleStatus | "all") {
  await requireAuthorizedAdmin();
  const supabase = getAdminClientOrThrow();
  let query = supabase
    .from("articles")
    .select(ARTICLES_COLUMNS)
    .order("updated_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as SupabaseArticle[]).map(mapArticleToViewModel);
}

export async function getAdminArticleById(id: string) {
  await requireAuthorizedAdmin();
  const supabase = getAdminClientOrThrow();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLES_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapArticleToViewModel(data as SupabaseArticle) : null;
}

export async function getAdminArticleStats() {
  const articles = await getAdminArticles("all");
  return {
    total: articles.length,
    published: articles.filter((article) => article.status === "published")
      .length,
    draft: articles.filter((article) => article.status === "draft").length,
    archived: articles.filter((article) => article.status === "archived")
      .length,
  };
}

export async function createArticle(
  _state: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  "use server";

  await requireAuthorizedAdmin();
  const parsed = parseArticleForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = getAdminClientOrThrow();
  const { data, error } = await supabase
    .from("articles")
    .insert(parsed.payload)
    .select("id")
    .single();

  if (error)
    return {
      error:
        error.code === "23505"
          ? "Ce slug est déjà utilisé."
          : "Erreur pendant la sauvegarde de l’article.",
    };
  if (parsed.payload.featured) await ensureSingleFeatured(String(data.id));

  revalidatePath("/");
  revalidatePath("/actualites");
  redirect("/admin/articles");
}

export async function updateArticle(
  id: string,
  _state: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  "use server";

  await requireAuthorizedAdmin();
  const parsed = parseArticleForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = getAdminClientOrThrow();
  const { error } = await supabase
    .from("articles")
    .update(parsed.payload)
    .eq("id", id);
  if (error)
    return {
      error:
        error.code === "23505"
          ? "Ce slug est déjà utilisé."
          : "Erreur pendant la mise à jour de l’article.",
    };
  if (parsed.payload.featured) await ensureSingleFeatured(id);

  revalidatePath("/");
  revalidatePath("/actualites");
  revalidatePath(`/articles/${parsed.payload.slug}`);
  redirect("/admin/articles");
}

export function getArticleFormDefaults(article?: Article | null) {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    category: article?.category ?? "",
    excerpt: article?.excerpt ?? "",
    cover_image_url: article?.cover_image_url ?? "",
    author: article?.author ?? "Agri-tech",
    content: article?.content ?? "",
    status: article?.status ?? "draft",
    featured: article?.featured ?? false,
    reading_time: article?.reading_time ?? "3 min de lecture",
    published_at: article?.published_at
      ? article.published_at.slice(0, 16)
      : "",
  };
}
