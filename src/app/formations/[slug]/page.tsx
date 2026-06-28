import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormationDetailPage } from "@/components/formations/FormationDetailPage";
import { formations, getFormationBySlug } from "@/data/formations";
import { createMetadata } from "@/lib/seo/metadata";

type FormationPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return formations.map((formation) => ({ slug: formation.slug }));
}

export async function generateMetadata({
  params,
}: FormationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);

  if (!formation) {
    return createMetadata({
      title: "Formation introuvable",
      path: `/formations/${slug}`,
    });
  }

  return createMetadata({
    title: `${formation.title} | Formations Agri-tech`,
    description: formation.shortDescription,
    path: `/formations/${formation.slug}`,
    image: formation.image,
  });
}

export default async function FormationPage({ params }: FormationPageProps) {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);

  if (!formation) {
    notFound();
  }

  return <FormationDetailPage formation={formation} />;
}
