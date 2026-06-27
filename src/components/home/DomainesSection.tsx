import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { homeDomains } from "@/data/home-domains";

export function DomainesSection() {
  return (
    <Section className="bg-gradient-to-b from-amber-50/70 via-white to-emerald-50/60">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">
          Nos domaines d’intervention
        </p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl lg:text-5xl">
          Des solutions agricoles adaptées au terrain haïtien.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
          Aperçu de nos principaux domaines. Découvrez l’ensemble de nos
          interventions et accompagnements sur la page Services.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {homeDomains.map((domain) => (
          <article
            key={domain.title}
            className="group flex h-full overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-sm shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10"
          >
            <div className="flex w-full flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-emerald-100">
                <Image
                  src={domain.image}
                  alt={domain.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <Badge tone="green" className="w-fit">
                  {domain.category}
                </Badge>
                <h3 className="mt-4 text-2xl font-black tracking-tight text-emerald-950">
                  {domain.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {domain.description}
                </p>
                <Link
                  href={domain.href}
                  className="mt-6 inline-flex w-fit items-center text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
                >
                  Demander ce service{" "}
                  <span
                    aria-hidden="true"
                    className="ml-1 transition group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button href="/services" size="lg" className="px-7">
          Voir tous nos services{" "}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Button>
      </div>
    </Section>
  );
}
