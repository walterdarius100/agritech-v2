import Image from "next/image";
import type { Metadata } from "next";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleShareActions } from "@/components/articles/ArticleShareActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { env } from "@/lib/env";
import { articles } from "@/data/articles";
import { createMetadata } from "@/lib/seo/metadata";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  return createMetadata({
    title: article?.title ?? "Article Agri-tech",
    description: article?.excerpt ?? undefined,
    path: `/articles/${slug}`,
    image: article?.cover_image_url ?? undefined,
  });
}

function formatArticleDate(date: string | null) {
  if (!date) return "Date à confirmer";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

function estimateReadingTime(content: string | null) {
  if (!content) return "5 min de lecture";

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  return `${minutes} min de lecture`;
}

function getLatestRelatedArticles(currentSlug: string) {
  return articles
    .filter((item) => item.slug !== currentSlug)
    .sort(
      (first, second) =>
        new Date(
          `${second.published_at ?? second.created_at ?? "1970-01-01"}T00:00:00Z`,
        ).getTime() -
        new Date(
          `${first.published_at ?? first.created_at ?? "1970-01-01"}T00:00:00Z`,
        ).getTime(),
    )
    .slice(0, 3);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  if (!article) {
    return (
      <Section>
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <Badge tone="slate">Article introuvable</Badge>
          <h1 className="mt-4 text-3xl font-bold text-emerald-950">
            Cet article n’est pas encore disponible
          </h1>
          <p className="mt-4 text-slate-600">
            La structure dynamique est prête pour Supabase. Vérifiez le lien ou
            retournez aux actualités.
          </p>
          <Button href="/actualites" className="mt-6">
            Retour aux actualités
          </Button>
        </div>
      </Section>
    );
  }

  const articleUrl = new URL(
    `/articles/${article.slug}`,
    env.siteUrl,
  ).toString();
  const relatedArticles = getLatestRelatedArticles(article.slug);
  const readingTime = estimateReadingTime(article.content);

  return (
    <>
      <section className="bg-emerald-950 py-14 text-white sm:py-18">
        <Container>
          <article className="mx-auto max-w-4xl">
            <Button
              href="/actualites"
              variant="ghost"
              className="mb-8 rounded-none px-0 text-emerald-50 hover:bg-transparent hover:text-white"
            >
              ← Retour aux actualités
            </Button>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
              {article.category ?? "Article"} ·{" "}
              {formatArticleDate(article.published_at)} · {readingTime}
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
                Par {article.author ?? "Équipe Agri-tech"}
              </p>
              <Button
                href="#partager"
                variant="outline"
                className="w-fit border-white/60 text-white hover:bg-white/10"
              >
                Partager
              </Button>
            </div>
          </article>
        </Container>
      </section>

      <main className="bg-[#f8faf7] pb-16 sm:pb-20">
        {article.cover_image_url ? (
          <Container className="pt-8 sm:pt-10">
            <div className="mx-auto max-w-6xl rounded-2xl border border-emerald-950/10 bg-white/60 p-1 shadow-sm">
              <div className="relative h-64 overflow-hidden rounded-xl bg-emerald-900 sm:h-96 lg:h-[30rem]">
                <Image
                  src={article.cover_image_url}
                  alt={`Photo principale de l’article : ${article.title}`}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </Container>
        ) : null}

        <Container className="pt-10 sm:pt-12">
          <article className="mx-auto max-w-3xl text-lg leading-8 text-slate-700">
            <p>{article.content}</p>

            <div
              className="mt-10 border-t border-emerald-950/10 pt-10"
              id="partager"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-emerald-950">
                  Vous avez aimé cet article ?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
                  Partagez-le avec vos proches et vos amis.
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
                  À lire aussi
                </p>
                <h2
                  id="related-articles-title"
                  className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl"
                >
                  Dernières actualités
                </h2>
              </div>
              <Button
                href="/actualites"
                variant="ghost"
                className="w-fit rounded-none px-0 text-emerald-800 hover:bg-transparent hover:text-emerald-950"
              >
                Voir toutes les actualités →
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.slug}
                  article={relatedArticle}
                />
              ))}
            </div>
          </section>
        </Container>
      </main>
    </>
  );
}
