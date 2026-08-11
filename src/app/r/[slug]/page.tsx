import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventResourceLeadForm } from "@/components/event-resources/EventResourceLeadForm";
import { siteConfig } from "@/config/site";
import { getActiveEventResourceBySlug } from "@/lib/event-resources/getEventResourceBySlug";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default async function EventResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getActiveEventResourceBySlug(slug);

  if (!resource) notFound();

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto max-w-xl">
        <header className="mb-7 flex items-center justify-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-950 shadow-sm">
            <Image
              alt="Logo Agri-tech"
              className="size-8 object-contain"
              height={32}
              priority
              src="/images/brand/Untitled-1.png"
              width={32}
            />
          </span>
          <div className="text-left">
            <p className="text-lg font-extrabold text-emerald-950">
              {siteConfig.name}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Ressource offerte
            </p>
          </div>
        </header>

        <article className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-xl shadow-emerald-950/5">
          <div className="bg-emerald-950 px-6 py-8 text-white sm:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">
              Ressource Agri-tech
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              {resource.title}
            </h1>
            {resource.description ? (
              <p className="mt-4 leading-7 text-emerald-50/90">
                {resource.description}
              </p>
            ) : null}
            {resource.event_name || resource.topic ? (
              <dl className="mt-6 grid gap-3 border-t border-white/15 pt-5 text-sm sm:grid-cols-2">
                {resource.event_name ? (
                  <div>
                    <dt className="font-bold text-emerald-200">Événement</dt>
                    <dd className="mt-1 text-white">{resource.event_name}</dd>
                  </div>
                ) : null}
                {resource.topic ? (
                  <div>
                    <dt className="font-bold text-emerald-200">Sujet</dt>
                    <dd className="mt-1 text-white">{resource.topic}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <p className="mb-6 text-sm leading-6 text-slate-600">
              Cette ressource vous est offerte par Agri-tech à la suite de cette
              intervention.
            </p>
            <EventResourceLeadForm
              language={resource.language}
              slug={resource.slug}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
