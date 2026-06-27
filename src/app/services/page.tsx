import type { Metadata } from "next";

import { PageHero } from "@/components/common/PageHero";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Section } from "@/components/ui/Section";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Services agricoles", path: "/services" });

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services agricoles" title="Des accompagnements techniques pour avancer avec méthode" description="Poulet de chair, pondeuses, écloserie, cuniculture, apiculture, pisciculture, maraîchage, irrigation, biogaz et équipements : Agri-tech structure les projets selon les réalités du terrain." primaryCta={{ label: "Demander un accompagnement", href: "/contact" }} />
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.slug} service={service} />)}</div>
      </Section>
    </>
  );
}
