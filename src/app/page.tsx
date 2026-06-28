import type { Metadata } from "next";

import { CredibilitySection } from "@/components/home/CredibilitySection";
import { DomainesSection } from "@/components/home/DomainesSection";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFormationsSection } from "@/components/home/HomeFormationsSection";
import { HomeNewsSection } from "@/components/home/HomeNewsSection";
import { HomePartnershipsSection } from "@/components/home/HomePartnershipsSection";
import { HomeTestimonialsSection } from "@/components/home/HomeTestimonialsSection";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
      <CredibilitySection />
      <HomePartnershipsSection />
      <HomeTestimonialsSection />
      <HomeNewsSection />
    </>
  );
}
