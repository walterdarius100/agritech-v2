import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleShareActions } from "@/components/articles/ArticleShareActions";
import { ReadingProgressBar } from "@/components/articles/ReadingProgressBar";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";
import { getArticleBySlug } from "@/lib/articles/getArticleBySlug";
import {
  getArticleImage,
  getArticleReadingTime,
  getRelatedArticles,
  splitArticleContent,
  formatArticleDate,
  getArticleDate,
} from "@/lib/articles/getArticles";
import { createMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/i18n";
import { getLocalizedPath } from "@/i18n";
import { localizeArticle } from "@/i18n/articles";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return createMetadata({
    title: article?.title ?? "Article Agri-tech",
    description: article?.excerpt ?? undefined,
    path: `/articles/${slug}`,
    image: article?.cover_image_url ?? undefined,
  });
}

export default async function LocalizedArticlePage({
  params,
  locale = "fr",
}: ArticlePageProps & { locale?: Locale }) {
  const { slug } = await params;
  const sourceArticle = await getArticleBySlug(slug);
  const article = sourceArticle ? localizeArticle(sourceArticle, locale) : null;

  if (!article) {
    notFound();
  }

  const articleUrl = new URL(
    `/articles/${article.slug}`,
    env.siteUrl,
  ).toString();
  const relatedArticles = (await getRelatedArticles(article.slug, 3)).map(
    (item) => localizeArticle(item, locale),
  );
  const readingTime = getArticleReadingTime(article);
  const contentParagraphs = splitArticleContent(article.content);
  const contentHtml = renderArticleContent(article.content);
  const copy =
    locale === "en"
      ? {
          back: "Back to news",
          by: "By",
          team: "Agri-tech team",
          share: "Share",
          liked: "Did you enjoy this article?",
          shareHelp: "Share it with your friends and colleagues.",
          related: "You may also like",
          latest: "Latest news",
          all: "View all news",
          alt: "Main article image",
        }
      : locale === "es"
        ? {
            back: "Volver a noticias",
            by: "Por",
            team: "Equipo Agri-tech",
            share: "Compartir",
            liked: "¿Te ha gustado este artículo?",
            shareHelp: "Compártelo con tus amigos y colegas.",
            related: "También te puede interesar",
            latest: "Últimas noticias",
            all: "Ver todas las noticias",
            alt: "Imagen principal del artículo",
          }
        : {
            back: "Retour aux actualités",
            by: "Par",
            team: "Équipe Agri-tech",
            share: "{copy.share}",
            liked: "{copy.liked}",
            shareHelp: "{copy.shareHelp}",
            related: "{copy.related}",
            latest: "{copy.latest}",
            all: "Voir toutes les actualités",
            alt: "Photo principale de l’article",
          };

  return (
    <>
      <ReadingProgressBar />
      <section className="bg-emerald-950 py-14 text-white sm:py-18">
        <Container>
          <article className="mx-auto max-w-4xl">
            <Button
              href={
                locale === "fr"
                  ? "/actualites"
                  : getLocalizedPath("/actualites", locale)
              }
              variant="ghost"
              className="mb-8 rounded-none px-0 text-emerald-50 hover:bg-transparent hover:text-white"
            >
              ← {copy.back}
            </Button>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
              {article.category ?? "Article"} ·{" "}
              {formatArticleDate(getArticleDate(article))} · {readingTime}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {article.title}
            </h1>
            {article.excerpt ? (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-emerald-50 sm:text-xl">
                {article.excerpt}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-emerald-50">
                {copy.by} {article.author ?? copy.team}
              </p>
              <Button
                href="#partager"
                variant="outline"
                className="w-fit border-white/60 text-white hover:bg-white/10"
              >
                {copy.share}
              </Button>
            </div>
          </article>
        </Container>
      </section>

      <main className="bg-[#f8faf7] pb-16 sm:pb-20">
        <Container className="pt-8 sm:pt-10">
          <div className="mx-auto max-w-6xl rounded-2xl border border-emerald-950/10 bg-white/60 p-1 shadow-sm">
            <div className="relative h-64 overflow-hidden rounded-xl bg-emerald-900 sm:h-96 lg:h-[30rem]">
              <Image
                src={getArticleImage(article)}
                alt={`${copy.alt}: ${article.title}`}
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Container>

        <Container className="pt-10 sm:pt-12">
          <article className="mx-auto max-w-3xl text-lg leading-8 text-slate-700">
            {contentHtml ? (
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              contentParagraphs.map((paragraph) => (
                <p key={paragraph} className="mt-6 first:mt-0">
                  {paragraph}
                </p>
              ))
            )}

            <div
              className="mt-10 border-t border-emerald-950/10 pt-10"
              id="partager"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-emerald-950">
                  {copy.liked}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
                  {copy.shareHelp}
                </p>
              </div>
              <div className="mt-6">
                <ArticleShareActions
                  articleTitle={article.title}
                  articleUrl={articleUrl}
                />
              </div>
            </div>
          </article>
        </Container>

        <Container className="pt-14 sm:pt-16">
          <section
            aria-labelledby="related-articles-title"
            className="mx-auto max-w-6xl"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                  {copy.related}
                </p>
                <h2
                  id="related-articles-title"
                  className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl"
                >
                  {copy.latest}
                </h2>
              </div>
              <Button
                href={
                  locale === "fr"
                    ? "/actualites"
                    : getLocalizedPath("/actualites", locale)
                }
                variant="ghost"
                className="w-fit rounded-none px-0 text-emerald-800 hover:bg-transparent hover:text-emerald-950"
              >
                {copy.all} →
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.slug}
                  article={relatedArticle}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        </Container>
      </main>
    </>
  );
}

function isHtmlContent(content: string) {
  return /<([a-z][\w-]*)(\s[^>]*)?>[\s\S]*<\/\1>|<(br|hr|img)\b[^>]*>/i.test(
    content,
  );
}

function renderArticleContent(content: string) {
  if (!isHtmlContent(content)) return "";

  return content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\s(on\w+)="[^"]*"/gi, "")
    .replace(/\s(on\w+)='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}
