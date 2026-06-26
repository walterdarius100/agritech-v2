import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Mentions légales", path: "/mentions-legales" });

export default function MentionsLegalesPage() {
  return (
    <Section>
      <SectionHeader title="Mentions légales" description="Informations légales provisoires de la V2 publique Agri-tech." />
      <div className="mx-auto mt-10 max-w-3xl space-y-6 rounded-3xl border border-emerald-100 bg-white p-8 leading-7 text-slate-700 shadow-sm">
        <p><strong>Éditeur :</strong> Agri-tech / WAL AGRITECH.</p>
        <p><strong>Domaine :</strong> {siteConfig.url}</p>
        <p><strong>Contact :</strong> {siteConfig.contactEmail}</p>
        <p>Le formulaire de contact de cette V2 est préparé visuellement. La collecte et le traitement automatisé de données seront documentés avant activation.</p>
        <p>Microsoft Clarity et Google Analytics 4 sont prévus pour la V2 afin de mesurer l’audience et améliorer l’expérience utilisateur.</p>
      </div>
    </Section>
  );
}
