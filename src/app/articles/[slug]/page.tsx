import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { createMetadata } from "@/lib/seo/metadata";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  return createMetadata({ title: `Article : ${slug}`, description: "Structure d'article Agri-tech prête pour les contenus dynamiques Supabase.", path: `/articles/${slug}` });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const readableTitle = slug.replaceAll("-", " ");

  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <Badge variant="neutral">Article dynamique à connecter</Badge>
        <h1 className="mt-5 text-4xl font-bold capitalize tracking-tight text-emerald-950 sm:text-5xl">{readableTitle}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Cette page prépare la structure SEO et éditoriale des futurs articles Agri-tech. Le contenu sera récupéré depuis Supabase dans une prochaine étape.</p>
        <Card as="div" className="mt-10"><p className="text-sm font-semibold text-orange-600">Slug : {slug}</p><p className="mt-3 text-slate-600">Emplacements prévus : catégorie, auteur, date de publication, image de couverture, sommaire et contenu riche.</p></Card>
      </article>
    </Section>
  );
}
