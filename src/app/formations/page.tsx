import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formations } from "@/data/formations";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Formations Agri-tech", description: "Formations agricoles pratiques proposées par Agri-tech pour les porteurs de projets en Haïti.", path: "/formations" });

export default function FormationsPage() {
  return (
    <Section>
      <SectionHeader title="Formations Agri-tech" description="Une base initiale pour structurer les futures formations pratiques et la future Agri-tech Academy." />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {formations.map((formation) => <Card key={formation.slug}><div className="flex flex-wrap gap-2"><Badge>{formation.format}</Badge><Badge variant="neutral">{formation.level}</Badge></div><h2 className="mt-4 text-xl font-bold text-emerald-950">{formation.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{formation.description}</p><Button href="/contact" variant="ghost" className="mt-5 px-0">Demander cette formation</Button></Card>)}
      </div>
    </Section>
  );
}
