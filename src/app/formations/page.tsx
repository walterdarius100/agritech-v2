import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formations } from "@/data/formations";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Formations Agri-tech", path: "/formations" });

export default function FormationsPage() {
  return <Section><SectionHeader title="Formations Agri-tech" description="Une base initiale pour structurer les futures formations pratiques et la future Agri-tech Academy." /><div className="mt-10 grid gap-4 md:grid-cols-2">{formations.map((formation) => <article key={formation.slug} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-emerald-950">{formation.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{formation.description}</p><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-orange-600">{formation.format} · {formation.level}</p></article>)}</div></Section>;
}
