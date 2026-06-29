import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { articles } from "@/data/articles";

const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
const latestArticles = articles.filter((article) => article.slug !== featuredArticle.slug).slice(0, 3);

function formatArticleDate(date: string | null) {
  if (!date) return "Date à confirmer";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function HomeNewsSection() {
  return (
    <Section className="bg-[#fbfcf7]">
      <SectionHeader
        eyebrow="Actualités Agri-tech"
        title="Conseils, analyses et nouvelles du secteur agricole."
        description="Retrouvez nos articles, observations de terrain et contenus pratiques pour mieux comprendre les réalités agricoles en Haïti."
      />

      <article className="mt-10 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm ring-1 ring-slate-100 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative h-56 overflow-hidden bg-emerald-900 sm:h-64 lg:h-auto">
          {featuredArticle.cover_image_url ? (
            <Image
              src={featuredArticle.cover_image_url}
              alt={`Illustration agricole pour l’article : ${featuredArticle.title}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-500 hover:scale-105"
              priority
            />
          ) : null}
          <div className="absolute left-5 top-5 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            À la une
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-7 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            {featuredArticle.category} · {formatArticleDate(featuredArticle.published_at)}
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">{featuredArticle.title}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{featuredArticle.excerpt}</p>
          <Button href={`/articles/${featuredArticle.slug}`} variant="ghost" className="mt-6 justify-start rounded-none px-0 text-emerald-800 hover:bg-transparent hover:text-emerald-950">
            Lire l’article →
          </Button>
        </div>
      </article>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {latestArticles.map((article) => (
          <article key={article.slug} className="flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="relative h-52 overflow-hidden bg-emerald-900">
              {article.cover_image_url ? (
                <Image src={article.cover_image_url} alt={`Illustration agricole pour l’article : ${article.title}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">{article.category}</span>
                <span className="text-xs font-medium text-slate-500">{formatArticleDate(article.published_at)}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold leading-snug text-emerald-950">{article.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{article.excerpt}</p>
              <Button href={`/articles/${article.slug}`} variant="ghost" className="mt-5 justify-start rounded-none px-0 text-emerald-800 hover:bg-transparent hover:text-emerald-950">
                Lire l’article →
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button href="/actualites" className="rounded-xl bg-emerald-800 hover:bg-emerald-900">
          Voir toutes les actualités →
        </Button>
      </div>
    </Section>
  );
}
