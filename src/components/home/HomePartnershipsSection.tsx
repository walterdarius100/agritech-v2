"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { partnerships } from "@/data/partnerships";

const AUTOPLAY_DELAY = 5000;

export function HomePartnershipsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % partnerships.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    const activeCard = cardRefs.current[activeIndex];

    if (!carousel || !activeCard) return;

    carousel.scrollTo({
      left: activeCard.offsetLeft,
      behavior: "smooth",
    });
  }, [activeIndex]);

  return (
    <Section className="overflow-hidden bg-[#fbf6ea]">
      <SectionHeader
        eyebrow="PARTENARIATS"
        title="Construisons ensemble des projets agricoles à fort impact"
        description="Agri-tech collabore avec des entreprises, ONG et associations souhaitant développer des initiatives agricoles concrètes, durables et adaptées aux réalités du terrain."
      />

      <div className="relative mx-auto mt-10 max-w-6xl overflow-hidden">
        <div
          ref={carouselRef}
          aria-label="Carousel des opportunités de partenariat"
          className="flex snap-x snap-mandatory gap-5 overflow-hidden scroll-smooth px-1 py-2 sm:gap-6"
        >
          {partnerships.map((partnership, index) => (
            <article
              key={partnership.id}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className="group relative h-[360px] min-w-full snap-start overflow-hidden rounded-2xl bg-emerald-950 shadow-lg ring-1 ring-emerald-900/10 sm:h-[390px] sm:min-w-[72%] md:min-w-[54%] lg:min-w-[38%]"
            >
              <Image
                src={partnership.imageSrc}
                alt={partnership.imageAlt}
                fill
                sizes="(min-width: 1024px) 38vw, (min-width: 768px) 54vw, (min-width: 640px) 72vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/35 via-slate-950/30 to-slate-950/82" />
              <div className="absolute inset-0 bg-emerald-950/10 mix-blend-multiply" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7">
                <span className="w-fit rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur-md">
                  {partnership.badge}
                </span>

                <h2 className="max-w-sm text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-3xl">
                  {partnership.title}
                </h2>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button href="/contact" className="rounded-xl bg-emerald-800 px-6 hover:bg-emerald-900">
          Discuter d’un partenariat
        </Button>
      </div>
    </Section>
  );
}
