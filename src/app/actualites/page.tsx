import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Actualités agricoles", path: "/actualites" });

export default function ActualitesPage() {
  return <Section><SectionHeader title="Actualités agricoles" description="Cette section accueillera les articles, actualités et ressources éducatives publiés depuis Supabase." /><div className="mt-10 rounded-2xl border border-dashed border-emerald-200 bg-white p-8 text-center text-slate-600">Les premiers articles dynamiques seront ajoutés dans une prochaine phase.</div></Section>;
}
