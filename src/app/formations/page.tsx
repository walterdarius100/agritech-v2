import type { Metadata } from "next";

import { FormationCard } from "@/components/formations/FormationCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { formations } from "@/data/formations";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Formations agricoles en Haïti | Agri-tech",
  description:
    "Découvrez les formations agricoles d’Agri-tech : aviculture, cuniculture, apiculture, pisciculture, production végétale et gestion de projet agricole.",
  path: "/formations",
});

export default function FormationsPage() {
  return (
    <>
      <section className="bg-[#f8faf7]">
        <div className="relative overflow-hidden bg-emerald-950 py-14 text-white sm:py-16 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(249,115,22,0.22),transparent_26%),radial-gradient(circle_at_86%_15%,rgba(34,197,94,0.2),transparent_28%)]" />
          <Container className="relative">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">
                FORMATIONS AGRI-TECH
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
                Des formations agricoles pratiques pour apprendre, produire et
                mieux gérer.
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/80">
                Agri-tech propose des formations adaptées aux jeunes,
                producteurs, organisations et porteurs de projets qui souhaitent
                renforcer leurs compétences agricoles dans un cadre concret,
                clair et orienté terrain.
              </p>
            </div>
          </Container>
        </div>
      </section>

      <Section className="bg-[#f8faf7]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Catalogue des formations
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
            Choisissez une formation adaptée à votre projet agricole
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Chaque module présente des bases techniques, des repères de gestion
            et des ressources pratiques pour aider les participants à avancer
            avec plus de méthode.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {formations.map((formation) => (
            <FormationCard key={formation.slug} formation={formation} />
          ))}
        </div>

        <section className="mt-12 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-emerald-100 sm:p-10">
          <h2 className="text-2xl font-bold text-emerald-950 sm:text-3xl">
            Besoin d’une formation pour vous ou votre organisation ?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
            Agri-tech peut organiser des formations adaptées à vos objectifs, à
            votre public et à votre réalité de terrain.
          </p>
          <Button href="/contact?subject=formation" className="mt-6">
            Demander une formation →
          </Button>
        </section>
      </Section>
    </>
  );
}
