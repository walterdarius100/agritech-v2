import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceDetailPage } from "@/components/services/ServiceDetailPage";
import { getServiceBySlug, services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return createMetadata({ title: "Service introuvable", path: `/services/${slug}` });
  }

  return createMetadata({
    title: `${service.title} | Services Agri-tech`,
    description: service.shortDescription,
    path: `/services/${service.slug}`,
    image: service.image,
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return <ServiceDetailPage service={service} />;
}
