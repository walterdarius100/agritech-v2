import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Politique de confidentialité", path: "/politique-confidentialite" });

export default function PolitiqueConfidentialitePage() {
  return (
    <Section>
      <SectionHeader title="Politique de confidentialité" description="Base de politique pour préparer les futures fonctionnalités connectées de la V2." />
      <div className="mx-auto mt-10 max-w-3xl space-y-6 rounded-3xl border border-emerald-100 bg-white p-8 leading-7 text-slate-700 shadow-sm">
        <p>Agri-tech / WAL AGRITECH prépare une V2 du site {siteConfig.url} destinée aux services, formations et contenus agricoles.</p>
        <p>Les données personnelles pourront inclure les informations transmises via le formulaire : nom, email, téléphone, type de demande, domaine concerné et message.</p>
        <p>À cette étape, le formulaire n’envoie pas encore de données. Les connexions Supabase ou EmailJS ne sont pas activées.</p>
        <p>Microsoft Clarity et Google Analytics 4 sont prévus pour analyser l’audience et améliorer l’ergonomie, avec une configuration à finaliser avant mise en production.</p>
        <p>Pour toute demande relative aux données personnelles, contactez : {siteConfig.contactEmail}.</p>
      </div>
    </Section>
  );
}
