import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Services agricoles", path: "/services" });

export default function ServicesPage() {
  return <Section><SectionHeader title="Services agricoles" description="Une première cartographie des domaines d'accompagnement agricole proposés par Agri-tech." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <article key={service.slug} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-orange-600">{service.category}</p><h2 className="mt-2 text-xl font-bold text-emerald-950">{service.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p></article>)}</div></Section>;
}
