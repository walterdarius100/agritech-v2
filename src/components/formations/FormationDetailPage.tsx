import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { Formation } from "@/types/formation";

function CheckList({
  items,
  columns = true,
}: {
  items: string[];
  columns?: boolean;
}) {
  return (
    <ul
      className={
        columns
          ? "grid gap-4 text-sm leading-6 text-slate-700 sm:grid-cols-2"
          : "grid gap-4 text-sm leading-6 text-slate-700"
      }
    >
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100"
            aria-hidden="true"
          >
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function formatModuleNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function FormationDetailPage({ formation }: { formation: Formation }) {
  return (
    <>
      <section className="relative overflow-hidden bg-emerald-950 py-12 text-white sm:py-16 lg:py-20">
        <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
          <Image
            src={formation.image}
            alt={formation.imageAlt}
            fill
            priority
            sizes="58vw"
            className="object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/60 to-emerald-950/10" />
          <div className="absolute inset-0 bg-emerald-950/10" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(249,115,22,0.22),transparent_26%),radial-gradient(circle_at_80%_12%,rgba(34,197,94,0.16),transparent_30%)]" />
        <Container className="relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.72fr]">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">
                {formation.category}
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {formation.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
                {formation.shortDescription}
              </p>
              <Button
                href="/formations"
                variant="ghost"
                size="sm"
                className="mt-7 w-fit px-0 text-white/80 hover:bg-transparent hover:text-white"
              >
                ← Retour aux formations
              </Button>
            </div>
            <div className="relative h-64 overflow-hidden rounded-3xl bg-emerald-900/40 shadow-2xl ring-1 ring-white/10 lg:hidden">
              <Image
                src={formation.image}
                alt={formation.imageAlt}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-75 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/45 to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      <Section className="bg-[#f8faf7] bg-[linear-gradient(rgba(6,78,59,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(6,78,59,0.035)_1px,transparent_1px)] bg-[size:36px_36px]">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Aperçu
          </p>
          <h2 className="mt-3 text-3xl font-bold text-emerald-950">
            Présentation de la formation
          </h2>
          <div className="mt-5 space-y-4 text-base leading-8 text-slate-700">
            <p>{formation.detailIntro}</p>
            <p>
              Compétences abordées : {formation.skills.join(", ").toLowerCase()}
              .
            </p>
            <p>
              Ressources prévues :{" "}
              {formation.resources.join(", ").toLowerCase()}.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_0.75fr]">
          <section className="rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              OBJECTIFS
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Ce que vous saurez faire à la fin du parcours.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              La formation reste orientée action : chaque objectif prépare une
              décision concrète sur le terrain.
            </p>
            <div className="mt-8">
              <CheckList items={formation.objectives} />
            </div>
          </section>

          <aside className="rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              PUBLIC CIBLE
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-emerald-950">
              À qui s’adresse cette formation ?
            </h2>
            <div className="mt-6">
              <CheckList items={formation.audience} columns={false} />
            </div>
            <div className="mt-8 rounded-2xl bg-emerald-950 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/80">
                DURÉE INDICATIVE
              </p>
              <p className="mt-2 text-2xl font-bold">{formation.duration}</p>
            </div>
          </aside>
        </div>

        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
              PROGRAMME
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Un parcours découpé en modules progressifs.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Les modules ci-dessous structurent l’expérience d’apprentissage et
              donnent un aperçu du contenu abordé pendant la formation.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {formation.program.map((module, index) => (
              <article
                key={module.title}
                className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-800 ring-1 ring-emerald-100">
                    {formatModuleNumber(index)}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-950">
                      {module.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {module.lessons.join(" · ")}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-emerald-950 p-8 text-white shadow-sm sm:p-10">
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
