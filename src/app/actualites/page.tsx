import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Actualités agricoles", description: "Actualités, articles éducatifs et ressources agricoles Agri-tech bientôt connectés à Supabase.", path: "/actualites" });

export default function ActualitesPage() {
  return (
    <Section>
      <SectionHeader title="Actualités agricoles" description="Cette section accueillera les articles, actualités et ressources éducatives publiés depuis Supabase." />
      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {["Articles récents", "Catégories", "Articles mis en avant", "Ressources éducatives"].map((item) => <Card key={item} as="div"><Badge variant="neutral">À connecter</Badge><h2 className="mt-4 text-lg font-bold text-emerald-950">{item}</h2><p className="mt-3 text-sm leading-6 text-slate-600">Structure prête pour la prochaine étape Supabase.</p></Card>)}
      </div>
    </Section>
  );
}
