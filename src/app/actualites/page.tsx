import type { Metadata } from "next";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { PageHero } from "@/components/common/PageHero";
import { Section } from "@/components/ui/Section";
import { articles } from "@/data/articles";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Actualités agricoles", path: "/actualites" });

export default function ActualitesPage() {
  return (
    <>
      <PageHero eyebrow="Actualités" title="Conseils, nouvelles et ressources agricoles" description="Une base éditoriale claire pour partager des conseils techniques, des actualités de formation et des ressources adaptées aux projets agricoles en Haïti." secondaryCta={{ label: "Parler à Agri-tech", href: "/contact" }} />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">{articles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
      </Section>
    </>
  );
}
