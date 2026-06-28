import Image from "next/image";

import type { Service } from "@/types/service";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-emerald-950">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ServiceDetailPage({ service }: { service: Service }) {
  return (
    <main className="bg-[#f8faf7]">
      <section className="bg-emerald-950 py-14 text-white sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-200">{service.category}</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">{service.title}</h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50">{service.shortDescription}</p>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="relative h-72 overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm sm:h-[430px]">
          <Image src={service.image} alt={service.imageAlt} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
        </div>

        <section className="mt-10 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Présentation</p>
          <h2 className="mt-3 text-2xl font-bold text-emerald-950">Un accompagnement pratique, adapté au terrain</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{service.detailIntro}</p>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <InfoCard title="À qui s’adresse ce service ?" items={service.audience} />
          <InfoCard title="Ce que Agri-tech peut vous apporter" items={service.agriTechSupport} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <InfoCard title="Notre approche" items={service.steps} />
          <InfoCard title="Résultats attendus" items={service.expectedResults} />
        </div>

        <section className="mt-10 rounded-2xl bg-emerald-900 p-8 text-white shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight">Vous souhaitez lancer ou structurer ce service ?</h2>
            <p className="mt-4 text-base leading-7 text-emerald-50">Agri-tech peut vous aider à analyser votre besoin, clarifier les étapes et préparer un accompagnement adapté à votre projet.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href={`/contact?service=${service.slug}`} variant="secondary" size="lg">Demander ce service →</Button>
              <Button href="/services" variant="outline" size="lg" className="border-white/70 text-white hover:bg-white/10">← Retour aux services</Button>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
