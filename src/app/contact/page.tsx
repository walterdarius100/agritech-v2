import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Contacter Agri-tech", path: "/contact" });

export default function ContactPage() {
  return <Section><SectionHeader title="Contacter Agri-tech" description="Une première page de contact en attendant le formulaire de leads connecté à Supabase." /><div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm"><p className="text-slate-600">Pour les demandes de services, formations ou accompagnement technique :</p><a className="mt-4 inline-block font-semibold text-emerald-700 hover:text-emerald-900" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></div></Section>;
}
