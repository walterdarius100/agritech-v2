import type { Metadata } from "next";

import { ContactFormShell } from "@/components/contact/ContactFormShell";
import { PageHero } from "@/components/common/PageHero";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Contacter Agri-tech", path: "/contact" });

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Discutons de votre projet agricole" description="Décrivez votre besoin, votre domaine et vos objectifs. L’équipe Agri-tech pourra ensuite vous orienter vers la solution, la formation ou l’accompagnement adapté." />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl bg-emerald-950 p-8 text-white">
            <Badge tone="orange">Coordonnées</Badge>
            <h2 className="mt-5 text-2xl font-bold">Agri-tech / WAL AGRITECH</h2>
            <p className="mt-4 text-emerald-50">Services techniques, formations pratiques et contenus éducatifs agricoles en Haïti.</p>
            <a className="mt-6 block font-semibold text-orange-200" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            <p className="mt-2 text-sm text-emerald-100">{siteConfig.url}</p>
            <div className="mt-8 space-y-3 text-sm text-emerald-50"><p>Types de demandes : consultation, formation, projet agricole, partenariat.</p><p>Domaines : aviculture, élevage, maraîchage, irrigation, pisciculture, biogaz.</p></div>
          </aside>
          <ContactFormShell />
        </div>
      </Section>
    </>
  );
}
