import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formations } from "@/data/formations";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Formations Agri-tech", path: "/formations" });

export default function FormationsPage() {
  return (
    <Section>
      <SectionHeader title="Formations Agri-tech" description="Des formations pratiques pour comprendre, lancer et améliorer des activités agricoles avec une approche adaptée au terrain." />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {formations.map((formation) => (
          <Card key={formation.slug}>
            <div className="flex flex-wrap gap-2"><Badge>{formation.format}</Badge><Badge tone="slate">{formation.level}</Badge></div>
            <h2 className="mt-4 text-xl font-bold text-emerald-950">{formation.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{formation.description}</p>
            <Button href="/contact" variant="outline" size="sm" className="mt-6">Demander cette formation</Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
