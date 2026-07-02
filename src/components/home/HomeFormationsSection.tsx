import Image from "next/image";
import Link from "next/link";

export function HomeFormationsSection() {
  return (
    <section className="w-full bg-emerald-950">
      <div className="grid w-full lg:grid-cols-2">
        <div className="relative min-h-[340px] overflow-hidden sm:min-h-[420px] lg:min-h-[560px]">
          <Image
            src="/images/formations/formation-poulet.jpg"
            alt="Étudiants et porteurs de projets agricoles accompagnés par Agri-tech Academy"
            fill
            priority={false}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-emerald-950/35 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/35 via-transparent to-transparent" />
        </div>

        <div className="flex items-center bg-emerald-950 px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-18 xl:px-24">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-emerald-100/80">
              Agri-tech Academy
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              L’espace de formation pour structurer vos compétences agricoles
            </h2>
            <p className="mt-6 text-base leading-8 text-white/75 sm:text-lg">
              Agri-tech Academy est l’espace de formation d’Agri-tech, conçu pour accompagner les porteurs de projets agricoles, les étudiants, les techniciens et les entrepreneurs qui veulent renforcer leurs compétences de manière structurée.
            </p>
            <Link
              href="/academy"
              className="group mt-9 inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:border-white/45 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950"
            >
              Découvrir notre Academy
              <span aria-hidden="true" className="ml-2 transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
