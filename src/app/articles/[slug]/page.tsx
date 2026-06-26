import type { Metadata } from "next";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { createMetadata } from "@/lib/seo/metadata";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  return createMetadata({ title: "Article Agri-tech", path: `/articles/${slug}` });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  return <Section><SectionHeader title="Article Agri-tech" description="Cette page dynamique est prête à recevoir les contenus d'articles depuis Supabase." /><div className="mt-10 rounded-2xl border border-emerald-100 bg-white p-8"><p className="text-sm font-semibold text-orange-600">Slug : {slug}</p><p className="mt-3 text-slate-600">Le contenu complet sera branché à la table articles dans une phase ultérieure.</p></div></Section>;
}
