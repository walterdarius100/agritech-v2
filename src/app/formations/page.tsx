import type { Metadata } from "next";

import { PageHero } from "@/components/common/PageHero";
import { FormationCard } from "@/components/formations/FormationCard";
import { Section } from "@/components/ui/Section";
import { formations } from "@/data/formations";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Formations Agri-tech", path: "/formations" });

export default function FormationsPage() {
  return (
    <>
      <PageHero eyebrow="Formations Agri-tech" title="Des formations pratiques pour produire et gérer autrement" description="Nos formations relient les bases techniques aux contraintes économiques et locales : aviculture, poulet de chair, pondeuses, cuniculture, apiculture, pisciculture et modules personnalisés." primaryCta={{ label: "Demander une formation", href: "/contact" }} />
      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{formations.map((formation) => <FormationCard key={formation.slug} formation={formation} />)}</div>
      </Section>
    </>
  );
}
