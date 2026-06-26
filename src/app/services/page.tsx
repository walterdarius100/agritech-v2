import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Services agricoles", path: "/services" });

export default function ServicesPage() {
  return (
    <Section>
      <SectionHeader title="Services agricoles" description="Une cartographie claire des domaines d'accompagnement technique proposés par Agri-tech pour les projets agricoles en Haïti." />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.slug}>
            <Badge tone="orange">{service.category}</Badge>
            <h2 className="mt-4 text-xl font-bold text-emerald-950">{service.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
            <Button href="/contact" variant="outline" size="sm" className="mt-6">Demander un accompagnement</Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
