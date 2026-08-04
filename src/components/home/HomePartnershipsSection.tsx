"use client";

import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { partnerships } from "@/data/partnerships";
import type { Locale } from "@/i18n";
import { getLocalizedPath } from "@/i18n";
import { publicContent } from "@/i18n/public-content";

export function HomePartnershipsSection({
  locale = "fr",
}: {
  locale?: Locale;
}) {
  const content = publicContent[locale].partnerships;
  const localizedPartnerships = partnerships.map((item, index) => {
    if (locale === "fr") return item;
    const en = [
      [
        "Local NGOs",
        "High-impact agricultural projects for communities and local youth.",
      ],
      [
        "Associations",
        "Training and agricultural projects for local community initiatives.",
      ],
      [
        "Businesses",
        "Agricultural solutions tailored to businesses and private initiatives.",
      ],
    ];
    const es = [
      [
        "ONG locales",
        "Proyectos agrícolas de impacto social para comunidades y jóvenes.",
      ],
      [
        "Asociaciones",
        "Formaciones y proyectos agrícolas para iniciativas comunitarias.",
      ],
      [
        "Empresas",
        "Soluciones agrícolas adaptadas a empresas e iniciativas privadas.",
      ],
    ];
    const [badge, title] = (locale === "en" ? en : es)[index];
    return { ...item, badge, title };
  });
  const carouselItems = [...localizedPartnerships, ...localizedPartnerships];
  return (
    <Section className="overflow-hidden bg-transparent py-12 sm:py-16 lg:py-18">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      <div className="relative mx-auto mt-8 max-w-6xl overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:mt-9">
        <div
          aria-label={content.carousel}
          className="flex w-max gap-4 motion-safe:animate-[partnership-marquee_28s_linear_infinite] hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] sm:gap-5"
        >
          {carouselItems.map((partnership, index) => {
            const isDuplicate = index >= localizedPartnerships.length;

            return (
              <article
                key={`${partnership.id}-${index}`}
                aria-hidden={isDuplicate ? "true" : undefined}
                className="group relative h-[196px] w-[78vw] max-w-[300px] shrink-0 overflow-hidden rounded-xl bg-emerald-950 shadow-md ring-1 ring-emerald-900/10 sm:h-[202px] sm:w-[300px] md:w-[310px] lg:h-[210px] lg:w-[330px]"
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

                  <p className="mt-2 max-w-[16rem] text-[0.82rem] font-medium leading-relaxed text-white drop-shadow-sm sm:text-sm">
                    {partnership.title}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-7 flex justify-center">
        <Button
          href={
            locale === "fr" ? "/contact" : getLocalizedPath("/contact", locale)
          }
          className="rounded-xl bg-emerald-800 px-6 hover:bg-emerald-900"
        >
          {content.action} →
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
