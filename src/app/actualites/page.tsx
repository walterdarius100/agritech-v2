import Image from "next/image";
import type { Metadata } from "next";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  formatArticleDate,
  getArticleDate,
  getArticleImage,
  getPublishedArticles,
} from "@/lib/articles/getArticles";
import { createMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

export const metadata: Metadata = createMetadata({
  title: "Actualités agricoles en Haïti",
  description:
    "Retrouvez les articles, analyses et conseils agricoles d’Agri-tech sur l’aviculture, la cuniculture, l’apiculture, la production végétale et les projets agricoles en Haïti.",
  path: "/actualites",
});

export default async function ActualitesPage() {
  const articles = await getPublishedArticles();
  const featuredArticle =
    articles.find((article) => article.featured) ?? articles[0] ?? null;
  const otherArticles = featuredArticle
    ? articles.filter((article) => article.slug !== featuredArticle.slug)
    : articles;

  return (
    <>
      <section className="bg-emerald-950 py-14 text-white sm:py-18">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
              Actualités Agri-tech
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Articles, analyses et conseils agricoles.
            </h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50">
              Retrouvez les publications, observations de terrain et contenus
              pratiques d’Agri-tech pour mieux comprendre les réalités agricoles
              en Haïti.
            </p>
            <div className="mt-8">
              <Button
                href="/contact"
                variant="outline"
                size="lg"
                className="border-white/70 text-white hover:bg-white/10"
              >
                Parler à Agri-tech
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Section className="bg-[#f8faf7]">
        {featuredArticle ? (
          <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm ring-1 ring-slate-100 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative h-56 overflow-hidden bg-emerald-900 sm:h-64 lg:h-auto">
              <Image
                src={getArticleImage(featuredArticle)}
                alt={`Illustration agricole pour l’article : ${featuredArticle.title}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-7 lg:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                {featuredArticle.category} ·{" "}
                {formatArticleDate(getArticleDate(featuredArticle))}
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                {featuredArticle.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {featuredArticle.excerpt}
              </p>
              <Button
                href={`/articles/${featuredArticle.slug}`}
                variant="ghost"
                className="mt-6 justify-start rounded-none px-0 text-emerald-800 hover:bg-transparent hover:text-emerald-950"
              >
                Lire l’article →
              </Button>
            </div>
          </article>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center text-slate-600 shadow-sm">
            Aucun article publié pour le moment.
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {otherArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Section>
    </>
  );
}
