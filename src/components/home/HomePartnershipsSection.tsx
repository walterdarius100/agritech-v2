"use client";

import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { partnerships } from "@/data/partnerships";

const carouselItems = [...partnerships, ...partnerships];

export function HomePartnershipsSection() {
  return (
    <Section className="overflow-hidden bg-[#fbf6ea] py-12 sm:py-16 lg:py-18">
      <SectionHeader
        eyebrow="PARTENARIATS"
        title="Construisons ensemble des projets agricoles à fort impact"
        description="Agri-tech collabore avec des entreprises, ONG et associations souhaitant développer des initiatives agricoles concrètes, durables et adaptées aux réalités du terrain."
      />

      <div className="relative mx-auto mt-8 max-w-6xl overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:mt-9">
        <div
          aria-label="Carousel en boucle des opportunités de partenariat"
          className="flex w-max gap-4 motion-safe:animate-[partnership-marquee_28s_linear_infinite] hover:[animation-play-state:paused] sm:gap-5"
        >
          {carouselItems.map((partnership, index) => {
            const isDuplicate = index >= partnerships.length;

            return (
              <article
                key={`${partnership.id}-${index}`}
                aria-hidden={isDuplicate ? "true" : undefined}
                className="group relative h-[220px] w-[78vw] max-w-[300px] shrink-0 overflow-hidden rounded-xl bg-emerald-950 shadow-md ring-1 ring-emerald-900/10 sm:h-[230px] sm:w-[300px] md:w-[310px] lg:h-[240px] lg:w-[330px]"
              >
                <Image
                  src={partnership.imageSrc}
                  alt={isDuplicate ? "" : partnership.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 330px, (min-width: 768px) 310px, (min-width: 640px) 300px, 78vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/15 via-slate-950/20 to-slate-950/86" />
                <div className="absolute inset-0 bg-emerald-950/15 mix-blend-multiply" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-3.5 sm:p-4">
                  <span className="inline-flex w-fit rounded-lg border border-white/20 bg-white/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white shadow-sm backdrop-blur-md">
                    {partnership.badge}
                  </span>

                  <p className="mt-2.5 max-w-[16rem] text-[0.82rem] font-semibold leading-relaxed text-white drop-shadow-sm sm:text-sm">
                    {partnership.title}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex justify-center">
        <Button href="/contact" className="rounded-xl bg-emerald-800 px-6 hover:bg-emerald-900">
          Discuter d’un partenariat →
        </Button>
      </div>

      <style jsx global>{`
        @keyframes partnership-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 0.5rem));
          }
        }

        @media (min-width: 640px) {
          @keyframes partnership-marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(calc(-50% - 0.625rem));
            }
          }
        }
      `}</style>
    </Section>
  );
}
