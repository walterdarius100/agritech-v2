import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function HomeHero() {
  return (
    <Section className="relative isolate min-h-[620px] overflow-hidden bg-emerald-950 text-white sm:min-h-[680px] lg:min-h-[720px]">
      <Image
        src="/images/hero/pepiniere.jpg"
        alt="Jeune producteur travaillant dans une pépinière agricole en Haïti"
        fill
        priority
        sizes="100vw"
        className="-z-30 object-cover object-center"
      />
      <div className="absolute inset-0 -z-20 bg-emerald-950/65" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,44,34,0.96)_0%,rgba(2,44,34,0.76)_42%,rgba(2,44,34,0.34)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,44,34,0.18)_0%,rgba(6,78,59,0.34)_48%,rgba(2,44,34,0.96)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-emerald-950 to-transparent" />

      <div className="flex min-h-[560px] items-center py-8 sm:min-h-[600px] sm:py-10 lg:min-h-[620px]">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200 sm:text-sm">Solutions agricoles modernes en Haïti</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-6xl lg:text-7xl">
            Votre projet agricole, bien accompagné
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-emerald-50/95 sm:text-lg">
            Agri-tech accompagne les entrepreneurs, institutions et producteurs en Haïti dans la conception, l’installation et le suivi de projets agricoles modernes, adaptés au terrain et prêts à avancer.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Button href="/contact" variant="secondary" size="lg" className="bg-orange-500 px-7 shadow-lg shadow-orange-950/25 hover:bg-orange-400">
              Demander une consultation <span aria-hidden="true" className="ml-2">→</span>
            </Button>
            <Link
              href="/services"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-base font-semibold text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950 sm:justify-start"
            >
              Voir nos domaines
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
