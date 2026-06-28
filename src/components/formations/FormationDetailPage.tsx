import Image from "next/image";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { Formation } from "@/types/formation";

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />{" "}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FormationDetailPage({ formation }: { formation: Formation }) {
  return (
    <>
      <section className="bg-emerald-950 py-12 text-white sm:py-16 lg:py-20">
        <Container>
          <Button
            href="/formations"
            variant="ghost"
            size="sm"
            className="mb-8 bg-white/10 text-white hover:bg-white/15"
          >
            ← Retour aux formations
          </Button>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <Badge
                tone="orange"
                className="bg-orange-200 text-orange-950 ring-orange-300"
              >
                {formation.category}
              </Badge>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                {formation.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-white/80">
                {formation.shortDescription}
              </p>
              <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-white/60">Durée</p>
                  <p className="mt-1 font-semibold">{formation.duration}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-white/60">Format</p>
                  <p className="mt-1 font-semibold">{formation.format}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-white/60">Niveau</p>
                  <p className="mt-1 font-semibold">{formation.level}</p>
                </div>
              </div>
            </div>
            <div className="relative h-72 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl sm:h-96">
              <Image
                src={formation.image}
                alt={formation.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      <Section className="bg-[#f8faf7]">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Aperçu
            </p>
            <h2 className="mt-3 text-3xl font-bold text-emerald-950">
              Présentation de la formation
            </h2>
          </div>
          <p className="text-base leading-8 text-slate-700">
            {formation.detailIntro}
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-emerald-950">
              Objectifs de la formation
            </h2>
            <div className="mt-5">
              <CheckList items={formation.objectives} />
            </div>
          </section>
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-emerald-950">
              À qui s’adresse cette formation ?
            </h2>
            <div className="mt-5">
              <CheckList items={formation.audience} />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-emerald-950">
            Programme de la formation
          </h2>
          <div className="mt-6 grid gap-4">
            {formation.program.map((module) => (
              <article
                key={module.title}
                className="rounded-2xl bg-emerald-50 p-5"
              >
                <h3 className="font-bold text-emerald-950">{module.title}</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">
                  {module.lessons.map((lesson) => (
                    <li key={lesson}>• {lesson}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-emerald-950">
              Compétences que vous allez développer
            </h2>
            <div className="mt-5">
              <CheckList items={formation.skills} />
            </div>
          </section>
          <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-emerald-950">
              Ressources incluses
            </h2>
            <div className="mt-5">
              <CheckList items={formation.resources} />
            </div>
          </section>
        </div>

        <section className="mt-12 rounded-3xl bg-emerald-950 p-8 text-white shadow-sm sm:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-bold">
                Vous souhaitez suivre cette formation ?
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-white/75">
                Contactez Agri-tech pour connaître les prochaines sessions, les
                modalités d’inscription et les conditions de participation.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                href={`/contact?formation=${formation.slug}`}
                variant="secondary"
              >
                Souscrire à cette formation →
              </Button>
              <Button
                href="/formations"
                variant="outline"
                className="border-white/70 text-white hover:bg-white/10"
              >
                ← Retour aux formations
              </Button>
            </div>
          </div>
        </section>
      </Section>
    </>
  );
}
