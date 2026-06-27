import type { Metadata } from "next";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { CredibilitySection } from "@/components/home/CredibilitySection";
import { DomainesSection } from "@/components/home/DomainesSection";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFormationsSection } from "@/components/home/HomeFormationsSection";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { articles } from "@/data/articles";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Votre projet agricole, bien accompagné",
  description: "Services techniques, formations pratiques et contenus éducatifs pour accompagner les projets agricoles en Haïti.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Section>
        <SectionHeader eyebrow="Présentation" title="Agri-tech accompagne les projets agricoles avec méthode" description="Nous aidons les porteurs de projets, producteurs, jeunes, associations et institutions à transformer une idée agricole en démarche claire : diagnostic, plan technique, installation, formation et suivi." />
      </Section>
      <DomainesSection />
      <Section>
        <SectionHeader eyebrow="Services" title="Services principaux" description="Des services techniques pour lancer, améliorer ou sécuriser les activités agricoles en Haïti." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">{services.filter((service) => service.featured).slice(0, 6).map((service) => <ServiceCard key={service.slug} service={service} />)}</div>
      </Section>
      <HomeFormationsSection />
      <Section>
        <SectionHeader eyebrow="Actualités" title="Conseils, nouvelles et ressources agricoles" description="Des contenus éducatifs pour mieux préparer les projets, formations et décisions techniques." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">{articles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
      </Section>
      <CredibilitySection />
    </>
  );
}
